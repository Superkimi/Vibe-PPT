import dns from "node:dns/promises";
import net from "node:net";

function isPrivateIpv4(hostname: string) {
  return (
    /^10\./.test(hostname) ||
    /^127\./.test(hostname) ||
    /^169\.254\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
}

function isPrivateIpv6(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (normalized.startsWith("::ffff:")) return isPrivateIpv4(normalized.slice(7));
  return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb");
}

export function isLoopbackHost(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return normalized === "localhost" || normalized === "::1" || normalized === "127.0.0.1";
}

export function isPrivateAddress(hostname: string) {
  return isPrivateIpv4(hostname) || isPrivateIpv6(hostname);
}

export async function validateProviderEndpoint(baseUrl: string) {
  const url = new URL(baseUrl);
  if (url.username || url.password) throw new Error("模型地址不能包含用户名或密码");
  const loopback = isLoopbackHost(url.hostname);
  if (url.protocol !== "https:" && !(loopback && process.env.NODE_ENV !== "production")) {
    throw new Error("模型地址必须使用 HTTPS");
  }
  if (process.env.NODE_ENV === "production" && loopback) {
    throw new Error("生产环境不能访问本机模型地址");
  }

  const addresses = net.isIP(url.hostname)
    ? [url.hostname]
    : process.env.NODE_ENV === "test"
      ? []
      : await dns.lookup(url.hostname, { all: true }).then((items) => items.map((item) => item.address));
  if (addresses.some((address) => isPrivateAddress(address) && !loopback)) {
    throw new Error("模型地址不能指向内网或本机地址");
  }
  return url.toString().replace(/\/$/, "");
}
