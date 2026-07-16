-- Add per-store default language for shared localization policy
ALTER TABLE "Store"
ADD COLUMN "defaultLanguage" TEXT;
