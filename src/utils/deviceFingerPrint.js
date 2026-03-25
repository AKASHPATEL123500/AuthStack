import crypto from "crypto";

const generateDeviceFingerprint = (req) => {
  const components = [
    req.ip,
    req.headers["user-agent"],
    req.headers["accept-language"],
    req.headers["accept-encoding"],
    req.headers["accept"],
  ].join("|");
  return crypto.createHash("sha256").update(components).digest("hex");
};

export default generateDeviceFingerprint;
