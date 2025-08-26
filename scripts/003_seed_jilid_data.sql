-- Insert jilid data
INSERT INTO jilid (jilid_name, description) VALUES
('Jilid 1', 'Pengenalan huruf hijaiyah dasar'),
('Jilid 2', 'Huruf hijaiyah dengan harakat'),
('Jilid 3', 'Bacaan panjang dan pendek'),
('Jilid 4', 'Bacaan mad dan qalqalah'),
('Jilid 5', 'Bacaan waqaf dan ibtida'),
('Jilid 6', 'Bacaan gharib dan musykilat');

-- Insert jilid_letters mapping (example for Jilid 1 - first 10 letters)
INSERT INTO jilid_letters (jilid_id, hijaiyah_id, sort_order) VALUES
(1, 1, 1), -- Alif
(1, 2, 2), -- Ba
(1, 3, 3), -- Ta
(1, 4, 4), -- Tsa
(1, 5, 5), -- Jim
(1, 6, 6), -- Ha
(1, 7, 7), -- Kho
(1, 8, 8), -- Dal
(1, 9, 9), -- Dzal
(1, 10, 10); -- Ra

-- Insert remaining letters for other jilid (simplified mapping)
INSERT INTO jilid_letters (jilid_id, hijaiyah_id, sort_order) VALUES
(2, 11, 1), (2, 12, 2), (2, 13, 3), (2, 14, 4), (2, 15, 5),
(3, 16, 1), (3, 17, 2), (3, 18, 3), (3, 19, 4), (3, 20, 5),
(4, 21, 1), (4, 22, 2), (4, 23, 3), (4, 24, 4),
(5, 25, 1), (5, 26, 2), (5, 27, 3),
(6, 28, 1);
