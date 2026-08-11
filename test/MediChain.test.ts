import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("MediChain", function () {

  // Deploy MediChain contract and prepare test accounts
  async function deployMediChainFixture() {
    const [admin, patient, doctor, doctor2] = await ethers.getSigners();

    // Get the MediChain contract factory
    const MediChain = await ethers.getContractFactory("MediChain");

    // Deploy a fresh MediChain contract
    const mediChain = await MediChain.deploy();

    return { mediChain, admin, patient, doctor, doctor2 };
  }

  // ============================================================
  // REGISTRATION TESTS
  // ============================================================
  describe("Registration", function () {

    // Test whether a user can successfully register as a patient
    it("Should register a patient", async function () {
      const { mediChain, patient } = await loadFixture(deployMediChainFixture);

      // Register patient with a name
      await expect(mediChain.connect(patient).registerPatient("John Doe"))
        .to.emit(mediChain, "PatientRegistered")
        .withArgs(patient.address, "John Doe");

      // Fetch the patient's stored information
      const p = await mediChain.patients(patient.address);

      // Verify that the patient is registered
      expect(p.isRegistered).to.be.true;

      // Verify that the patient's name was stored correctly
      expect(p.name).to.equal("John Doe");
    });

    // Test whether a user can successfully register as a doctor
    it("Should register a doctor", async function () {
      const { mediChain, doctor } = await loadFixture(deployMediChainFixture);

      // Set the doctor's consultation fee to 0.1 ETH
      const fee = ethers.parseEther("0.1");

      // Register doctor with name, specialization, and consultation fee
      await expect(
        mediChain.connect(doctor).registerDoctor(
          "Dr. Smith",
          "Cardiology",
          fee
        )
      )
        .to.emit(mediChain, "DoctorRegistered")
        .withArgs(doctor.address, "Dr. Smith", "Cardiology");

      // Fetch the doctor's stored information
      const d = await mediChain.doctors(doctor.address);

      // Verify that the doctor is registered
      expect(d.isRegistered).to.be.true;

      // Verify that the consultation fee is stored correctly
      expect(d.consultationFee).to.equal(fee);
    });
  });

  // ============================================================
  // RECORDS AND PERMISSIONS TESTS
  // ============================================================
  describe("Records and Permissions", function () {

    // Test whether a patient can add their own medical record
    it("Should allow patient to add a record", async function () {
      const { mediChain, patient } = await loadFixture(deployMediChainFixture);

      // Register the patient before adding a medical record
      await mediChain.connect(patient).registerPatient("John Doe");

      // Add a medical record using its IPFS CID and title
      await expect(
        mediChain.connect(patient).addRecord("QmTestHash", "Blood Test")
      )
        .to.emit(mediChain, "RecordAdded")
        .withArgs(1, patient.address, "Blood Test");

      // Retrieve all records belonging to the patient
      const records = await mediChain.getPatientRecords(patient.address);

      // Verify that exactly one record was added
      expect(records.length).to.equal(1);

      // Verify that the correct IPFS CID was stored
      expect(records[0].recordCid).to.equal("QmTestHash");
    });

    // Test whether a doctor can add a medical record
    // after the patient grants access permission
    it("Should allow doctor to add record if granted permission", async function () {
      const { mediChain, patient, doctor } = await loadFixture(deployMediChainFixture);

      // Register the patient
      await mediChain.connect(patient).registerPatient("John");

      // Register the doctor with zero consultation fee
      await mediChain.connect(doctor).registerDoctor(
        "Dr. Smith",
        "Cardiology",
        0
      );

      // Patient grants the doctor permission to access their records
      await mediChain.connect(patient).grantAccess(doctor.address);

      // Doctor adds an MRI record for the patient
      await expect(
        mediChain.connect(doctor).addRecordForPatient(
          patient.address,
          "QmTestHash2",
          "MRI"
        )
      )
        .to.emit(mediChain, "RecordAdded")
        .withArgs(1, patient.address, "MRI");
    });

    // Test whether a doctor is blocked from viewing records
    // when the patient has not granted permission
    it("Should block doctor from viewing patient records without permission", async function () {
      const { mediChain, patient, doctor } = await loadFixture(deployMediChainFixture);

      // Register the patient
      await mediChain.connect(patient).registerPatient("John");

      // Patient adds a medical record
      await mediChain.connect(patient).addRecord("hash", "title");

      // Doctor should not be able to view records without permission
      await expect(
        mediChain.connect(doctor).getPatientRecords(patient.address)
      )
        .to.be.revertedWith("Not authorized to view records");

      // Patient grants access to the doctor
      await mediChain.connect(patient).grantAccess(doctor.address);

      // Doctor should now be able to view the patient's records
      const records = await mediChain
        .connect(doctor)
        .getPatientRecords(patient.address);

      // Verify that the patient's record is accessible
      expect(records.length).to.equal(1);
    });
  });

  // ============================================================
  // APPOINTMENT TESTS
  // ============================================================
  describe("Appointments", function () {

    // Test the complete appointment flow:
    // Patient books appointment -> Doctor completes appointment -> Doctor receives fee
    it("Should book and complete an appointment successfully", async function () {
      const { mediChain, patient, doctor } = await loadFixture(deployMediChainFixture);

      // Set consultation fee to 1 ETH
      const fee = ethers.parseEther("1.0");

      // Register patient
      await mediChain.connect(patient).registerPatient("John");

      // Register doctor with 1 ETH consultation fee
      await mediChain.connect(doctor).registerDoctor(
        "Dr. Smith",
        "Cardio",
        fee
      );

      // ----------------------------------------------------------
      // BOOK APPOINTMENT
      // ----------------------------------------------------------

      // Patient books an appointment and sends the required fee
      await expect(
        mediChain.connect(patient).bookAppointment(
          doctor.address,
          { value: fee }
        )
      )
        .to.emit(mediChain, "AppointmentBooked")
        .withArgs(1, patient.address, doctor.address, fee);

      // Record doctor's balance before completing the appointment
      const beforeBal = await ethers.provider.getBalance(doctor.address);

      // ----------------------------------------------------------
      // COMPLETE APPOINTMENT
      // ----------------------------------------------------------

      // Doctor completes the appointment
      await expect(
        mediChain.connect(doctor).completeAppointment(1)
      )
        .to.emit(mediChain, "AppointmentCompleted")
        .withArgs(1, doctor.address, fee);

      // Record doctor's balance after completing the appointment
      const afterBal = await ethers.provider.getBalance(doctor.address);

      // Fee should be transferred to the doctor.
      // The balance increase is expected to be greater than the
      // previous balance despite the small gas cost of the transaction.
      expect(afterBal).to.be.greaterThan(beforeBal);
    });

    // Test whether a patient can cancel an appointment
    // and receive the deposited consultation fee back
    it("Should allow cancellation and refund patient", async function () {
      const { mediChain, patient, doctor } = await loadFixture(deployMediChainFixture);

      // Set consultation fee to 1 ETH
      const fee = ethers.parseEther("1.0");

      // Register patient
      await mediChain.connect(patient).registerPatient("John");

      // Register doctor with 1 ETH consultation fee
      await mediChain.connect(doctor).registerDoctor(
        "Dr. Smith",
        "Cardio",
        fee
      );

      // Record patient's balance before booking
      const pBeforeBal = await ethers.provider.getBalance(patient.address);

      // ----------------------------------------------------------
      // BOOK APPOINTMENT
      // ----------------------------------------------------------

      // Patient books the appointment and pays the consultation fee
      const tx = await mediChain.connect(patient).bookAppointment(
        doctor.address,
        { value: fee }
      );

      // Wait for the booking transaction to be mined
      const receipt = await tx.wait();

      // Calculate gas consumed during the booking transaction
      const gasUsedBook = receipt!.gasUsed * receipt!.gasPrice;

      // ----------------------------------------------------------
      // CANCEL APPOINTMENT
      // ----------------------------------------------------------

      // Patient cancels the appointment and receives a refund
      const tx2 = await mediChain.connect(patient).cancelAppointment(1);

      // Wait for the cancellation transaction to be mined
      const receipt2 = await tx2.wait();

      // Calculate gas consumed during the cancellation transaction
      const gasUsedCancel = receipt2!.gasUsed * receipt2!.gasPrice;

      // Record patient's final balance after cancellation
      const pAfterBal = await ethers.provider.getBalance(patient.address);

      // Expected final balance:
      // Initial balance - booking gas - cancellation gas
      // The 1 ETH appointment fee should be completely refunded.
      const expectedRefundDiff =
        pBeforeBal - gasUsedBook - gasUsedCancel;

      // Verify that the patient received the correct refund
      expect(pAfterBal).to.equal(expectedRefundDiff);
    });
  });
});
