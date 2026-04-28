import { z } from "zod";

export const TicketSource = z.enum(["email", "portal", "chat", "phone", "api"]);
export type TicketSource = z.infer<typeof TicketSource>;

export const Ticket = z.object({
  ticket_id: z.string().min(1),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  user_id: z.string().min(1),
  source: TicketSource.default("portal"),
  timestamp: z.string().datetime().optional(),
});
export type Ticket = z.infer<typeof Ticket>;
