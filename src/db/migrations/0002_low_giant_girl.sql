CREATE UNIQUE INDEX "user_id_idx" ON "users" USING btree ("id");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "todo_id_idx" ON "todos" USING btree ("id");