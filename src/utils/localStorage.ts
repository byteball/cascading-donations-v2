"use client";

const PREFIX = "KIVACH_";

export class LocalStorage {
  static get(key: string) {
    const value = localStorage.getItem(PREFIX + key);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  }

  static set(key: string, value: any) {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  }

  static remove(key: string) {
    localStorage.removeItem(PREFIX + key);
  }
}