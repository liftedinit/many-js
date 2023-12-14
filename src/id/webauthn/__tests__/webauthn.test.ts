import { Identifier } from "../../identifier";
import { WebAuthn } from "../webauthn";
import { CoseKey } from "../../../message/encoding";
import { makeMockPublicKeyCredential, mockPublicKeyCredential } from "./data";
import { strToBytes } from "../../../shared/utils";

const globalNavigator = global.navigator;

describe("WebAuthn", () => {
  beforeAll(() => {
    //@ts-ignore
    global.navigator.credentials.get.mockImplementation(
      makeMockPublicKeyCredential,
    );
    //@ts-ignore
    global.navigator.credentials.create.mockResolvedValue(
      mockPublicKeyCredential,
    );
  });
  afterAll(() => {
    global.navigator = globalNavigator;
  });
  describe("constructor", () => {
    it("should return a webauthn identifier", async () => {
      const webauthn = new WebAuthn(mockPublicKeyCredential);

      expect(webauthn instanceof WebAuthn).toBe(true);
      expect(webauthn instanceof Identifier).toBe(true);
    });
    it("should set the credential (and public key)", () => {
      const webauthn = new WebAuthn(mockPublicKeyCredential);

      expect(webauthn.credential).toBeDefined();
      expect(webauthn.publicKey).toBeDefined();
    });
  });
  describe("sign", () => {
    it("should return a signature", async () => {
      const webauthn = new WebAuthn(mockPublicKeyCredential);

      const sig1 = await webauthn.sign(strToBytes("foo"));
      const sig2 = await webauthn.sign(strToBytes("bar"));

      expect(sig1).not.toStrictEqual(sig2);
    });
  });
  describe("toString", () => {
    it("should return a Many address", () => {
      const webauthn = new WebAuthn(mockPublicKeyCredential);

      expect(webauthn.toString()).toMatch(/^m\w+$/);
    });
  });
  describe("toCoseKey", () => {
    it("should return a COSE Key", () => {
      const webauthn = new WebAuthn(mockPublicKeyCredential);
      const coseKey = webauthn.toCoseKey();

      expect(coseKey instanceof CoseKey).toBe(true);
    });
    it("should embed the public key", () => {
      const webauthn = new WebAuthn(mockPublicKeyCredential);
      const coseKey = webauthn.toCoseKey();

      expect(coseKey.publicKey).toStrictEqual(webauthn.publicKey);
    });
  });
  describe("create", () => {
    it("should return a webauthn identifier", async () => {
      const webauthn = await WebAuthn.create();

      expect(webauthn instanceof WebAuthn).toBe(true);
      expect(webauthn instanceof Identifier).toBe(true);
    });
  });
  describe("get", () => {
    it("should return a webauthn identifier", async () => {
      const rawId = strToBytes("2d8b2fa74fc479768b6c68dec22ab6ef0f9cee6e");
      const webauthn = await WebAuthn.get(rawId);

      expect(webauthn instanceof WebAuthn).toBe(true);
      expect(webauthn instanceof Identifier).toBe(true);
    });
    it("should have a matching credential ID", async () => {
      const rawId = strToBytes("2d8b2fa74fc479768b6c68dec22ab6ef0f9cee6e");
      const webauthn = await WebAuthn.get(rawId);

      expect(webauthn.credential.rawId).toStrictEqual(rawId);
    });
  });
  describe("fromString", () => {
    it("should throw", () => {
      const address = "maeo2ob5e6mgaxr2lqg6muoqwuqz6j3t6wv3eig4wgymkouafh";

      expect(() => WebAuthn.fromString(address)).toThrow();
    });
  });
});
