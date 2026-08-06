import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "chai";
import { AuthUseCases } from "../../src/auth/application/auth.use-cases";
import { FileUserRepository } from "../../src/auth/infrastructure/file-user.repository";
import { User } from "../../src/auth/domain/user";
import bcrypt from "bcryptjs";
import fs from "fs/promises";

const USERS_FILE_PATH = "./data/users.json";

let authUseCases: AuthUseCases;
let userRepository: FileUserRepository;
let registeredUser: User | null = null;
let updatedProfile: any = null;
let lastError: Error | null = null;

Before(async function () {
  try {
    await fs.unlink(USERS_FILE_PATH);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  userRepository = new FileUserRepository();
  authUseCases = new AuthUseCases(userRepository);

  registeredUser = null;
  updatedProfile = null;
  lastError = null;
});

Given("a registered user {string} with password {string} named {string} {string}", async function (email: string, password: string, firstName: string, lastName: string) {
  await authUseCases.register({ email, password, firstName, lastName });
  registeredUser = await userRepository.findByEmail(email);
});

When("I update the profile name to {string} and {string}", async function (firstName: string, lastName: string) {
  if (!registeredUser) {
    throw new Error("No registered user");
  }
  updatedProfile = await authUseCases.updateProfile(registeredUser.id, { firstName, lastName });
});

Then("the profile should be named {string} {string}", function (firstName: string, lastName: string) {
  expect(updatedProfile).to.not.be.null;
  expect(updatedProfile.firstName).to.equal(firstName);
  expect(updatedProfile.lastName).to.equal(lastName);
});

When("I update the password to {string} with current password {string}", async function (newPassword: string, currentPassword: string) {
  if (!registeredUser) {
    throw new Error("No registered user");
  }
  updatedProfile = await authUseCases.updateProfile(registeredUser.id, { newPassword, currentPassword });
});

When("I try to update the password to {string} with current password {string}", async function (newPassword: string, currentPassword: string) {
  try {
    if (!registeredUser) {
      throw new Error("No registered user");
    }
    await authUseCases.updateProfile(registeredUser.id, { newPassword, currentPassword });
  } catch (error: any) {
    lastError = error;
  }
});

Then("the profile should have the new password {string}", async function (password: string) {
  if (!registeredUser) {
    throw new Error("No registered user");
  }
  const user = await userRepository.findById(registeredUser.id);
  const isMatch = await bcrypt.compare(password, user!.passwordHash);
  expect(isMatch).to.be.true;
});

Then("I should receive a profile error saying {string}", function (message: string) {
  expect(lastError).to.not.be.null;
  expect(lastError?.message).to.equal(message);
});
