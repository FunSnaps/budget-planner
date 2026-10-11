import type { User, Session } from 'lucia';

declare global {
  namespace App {
    interface Locals {
      user: User | null;
      session: Session | null;
    }
    interface PageData {
      user: { id: string; email: string } | null;
    }
  }
}

export {};
