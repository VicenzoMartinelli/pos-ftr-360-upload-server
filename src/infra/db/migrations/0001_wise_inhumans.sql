ALTER TABLE "uploads" DROP CONSTRAINT "uploads_remoteKey_unique";--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_remote_key_unique" UNIQUE("remote_key");