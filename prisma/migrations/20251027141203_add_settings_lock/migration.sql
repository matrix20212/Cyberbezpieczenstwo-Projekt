-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "minLength" INTEGER NOT NULL DEFAULT 14,
    "requireDigit" BOOLEAN NOT NULL DEFAULT true,
    "requireLowercase" BOOLEAN NOT NULL DEFAULT true,
    "requireUppercase" BOOLEAN NOT NULL DEFAULT false,
    "requireSpecial" BOOLEAN NOT NULL DEFAULT false,
    "passwordExpiryDays" INTEGER NOT NULL DEFAULT 90,
    "maxLoginAttempts" INTEGER NOT NULL DEFAULT 5,
    "lockoutDurationMinutes" INTEGER NOT NULL DEFAULT 15,
    "sessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Settings" ("createdAt", "id", "minLength", "passwordExpiryDays", "requireDigit", "requireLowercase", "requireSpecial", "requireUppercase", "updatedAt") SELECT "createdAt", "id", "minLength", "passwordExpiryDays", "requireDigit", "requireLowercase", "requireSpecial", "requireUppercase", "updatedAt" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
