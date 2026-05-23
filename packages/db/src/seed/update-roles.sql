UPDATE public."user" SET role = 'admin', email_verified = true WHERE email = 'admin@test.com';
UPDATE public."user" SET email_verified = true WHERE email = 'siswa@test.com';
SELECT id, name, email, role FROM public."user";
