import type { RequestHandler } from "express";
import { sendErrorPage } from "./errors.ts";
import { timingSafeEqual } from "node:crypto";

export function validateRequestOrigin(appOrigin: string): RequestHandler {
  return (req, res, next) => {
    
    if (req.method !== "POST") {
      next();
      return;
    }

    const origin = req.header("Origin");
    if (origin) {
      if (origin === appOrigin) {
        next();
        return;
      }
      
      sendErrorPage(res, 403, "Forbidden", "the request did not come from the app");
      return;
    };
    try {
      const referer = req.header("Referer");
      if (referer) {
        if (new URL(referer).origin) {
          next(); 
          return;
        }
      }
    } catch (error) {
      sendErrorPage(res, 403, "Forbidden", "the request did not come from the app");
      return;
    }
    sendErrorPage(res, 403, "Forbidden", "the request did not come from the app");
    return;
  }
}

export function csrfTokensMatch(expected: string, actual: unknown): boolean {
  if (typeof actual !== "string") {return false;}
  
  const bufferExpected = Buffer.from(expected); 
  const bufferActual = Buffer.from(actual);
  if (bufferExpected.length !== bufferActual.length) {return false;}

  return timingSafeEqual(bufferExpected, bufferActual);
}
