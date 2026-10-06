-- Missing birth dates remain unknown; do not invent calendar dates for queue registration.
ALTER TABLE "pacientes" ALTER COLUMN "data_nascimento" DROP NOT NULL;
