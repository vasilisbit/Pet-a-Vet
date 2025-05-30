-- Use the petavet database
USE petavet;

-- Clear existing data (if needed)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE User;
TRUNCATE TABLE Customer;
TRUNCATE TABLE Veterinarian;
TRUNCATE TABLE Secretary;
TRUNCATE TABLE PetGroomer;
TRUNCATE TABLE Administrator;
TRUNCATE TABLE Pet;
TRUNCATE TABLE MedicalRecord;
TRUNCATE TABLE Appointment;
TRUNCATE TABLE ProductCategory;
TRUNCATE TABLE Product;
TRUNCATE TABLE Inventory;
TRUNCATE TABLE Cart;
TRUNCATE TABLE CartItem;
TRUNCATE TABLE `Order`;
TRUNCATE TABLE OrderItem;
TRUNCATE TABLE Subscription;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Users (Note: Password is 'password123' hashed with bcrypt)
INSERT INTO User (user_id, username, password, email, full_name, phone, address, role, status, created_at, last_login)
VALUES
-- Staff accounts (pre-created)
(1, 'admin', '$2b$10$1N7H0LOD8LHddRLBi4g1BOsOlRCadrMgzKqMQHCDqBGgBOevRwSHi', 'admin@petavet.com', 'Admin User', '+1 (555) 123-0001', '123 Admin St, New York, NY 10001', 'ADMINISTRATOR', 'ACTIVE', NOW(), NOW()),
(2, 'drsmith', '$2b$10$1N7H0LOD8LHddRLBi4g1BOsOlRCadrMgzKqMQHCDqBGgBOevRwSHi', 'drsmith@petavet.com', 'Dr. John Smith', '+1 (555) 123-0002', '456 Vet Ave, Boston, MA 02108', 'VETERINARIAN', 'ACTIVE', NOW(), NOW()),
(3, 'drjohnson', '$2b$10$1N7H0LOD8LHddRLBi4g1BOsOlRCadrMgzKqMQHCDqBGgBOevRwSHi', 'drjohnson@petavet.com', 'Dr. Emily Johnson', '+1 (555) 123-0003', '789 Medical Dr, Los Angeles, CA 90210', 'VETERINARIAN', 'ACTIVE', NOW(), NOW()),
(4, 'receptionist', '$2b$10$1N7H0LOD8LHddRLBi4g1BOsOlRCadrMgzKqMQHCDqBGgBOevRwSHi', 'reception@petavet.com', 'Sarah Johnson', '+1 (555) 123-0004', '789 Staff Rd, Chicago, IL 60601', 'SECRETARY', 'ACTIVE', NOW(), NOW()),
(5, 'secretary2', '$2b$10$1N7H0LOD8LHddRLBi4g1BOsOlRCadrMgzKqMQHCDqBGgBOevRwSHi', 'secretary2@petavet.com', 'Maria Garcia', '+1 (555) 123-0005', '456 Office Blvd, Miami, FL 33101', 'SECRETARY', 'ACTIVE', NOW(), NOW()),
(6, 'groomer', '$2b$10$1N7H0LOD8LHddRLBi4g1BOsOlRCadrMgzKqMQHCDqBGgBOevRwSHi', 'groomer@petavet.com', 'Mike Wilson', '+1 (555) 123-0006', '321 Groom St, San Francisco, CA 94101', 'PETGROOMER', 'ACTIVE', NOW(), NOW()),
(7, 'groomer2', '$2b$10$1N7H0LOD8LHddRLBi4g1BOsOlRCadrMgzKqMQHCDqBGgBOevRwSHi', 'groomer2@petavet.com', 'Lisa Chen', '+1 (555) 123-0007', '654 Spa Ave, Portland, OR 97201', 'PETGROOMER', 'ACTIVE', NOW(), NOW()),

-- Customer accounts (can be created through registration)
(8, 'johndoe', '$2b$10$1N7H0LOD8LHddRLBi4g1BOsOlRCadrMgzKqMQHCDqBGgBOevRwSHi', 'john@example.com', 'John Doe', '+1 (555) 123-4567', '123 Main St, New York, NY 10001', 'CUSTOMER', 'ACTIVE', NOW(), NOW()),
(9, 'janesmith', '$2b$10$1N7H0LOD8LHddRLBi4g1BOsOlRCadrMgzKqMQHCDqBGgBOevRwSHi', 'jane@example.com', 'Jane Smith', '+1 (555) 987-6543', '456 Park Ave, Boston, MA 02108', 'CUSTOMER', 'ACTIVE', NOW(), NOW()),
(10, 'robertj', '$2b$10$1N7H0LOD8LHddRLBi4g1BOsOlRCadrMgzKqMQHCDqBGgBOevRwSHi', 'robert@example.com', 'Robert Johnson', '+1 (555) 456-7890', '789 Oak St, Chicago, IL 60601', 'CUSTOMER', 'ACTIVE', NOW(), NOW()),
(11, 'sarahw', '$2b$10$1N7H0LOD8LHddRLBi4g1BOsOlRCadrMgzKqMQHCDqBGgBOevRwSHi', 'sarah@example.com', 'Sarah Williams', '+1 (555) 234-5678', '321 Pine St, San Francisco, CA 94101', 'CUSTOMER', 'ACTIVE', NOW(), NOW()),
(12, 'michaelb', '$2b$10$1N7H0LOD8LHddRLBi4g1BOsOlRCadrMgzKqMQHCDqBGgBOevRwSHi', 'michael@example.com', 'Michael Brown', '+1 (555) 876-5432', '654 Maple Ave, Seattle, WA 98101', 'CUSTOMER', 'ACTIVE', NOW(), NOW());

-- Insert role-specific records
-- Administrators
INSERT INTO Administrator (administrator_id, department, access_level)
VALUES (1, 'Management', 'FULL');

-- Veterinarians
INSERT INTO Veterinarian (veterinarian_id, specialization, license_number, years_of_experience)
VALUES 
(2, 'Small Animals', 'VET12345', 10),
(3, 'Exotic Animals', 'VET67890', 8);

-- Secretaries
INSERT INTO Secretary (secretary_id, department, position)
VALUES 
(4, 'Front Desk', 'Receptionist'),
(5, 'Administration', 'Administrative Assistant');

-- Pet Groomers
INSERT INTO PetGroomer (pet_groomer_id, specialization, years_of_experience)
VALUES 
(6, 'All Breeds', 5),
(7, 'Large Dogs', 7);

-- Customers
INSERT INTO Customer (customer_id, balance, subscription_id, preferred_payment_method)
VALUES 
(8, 0.00, NULL, 'CREDIT_CARD'),
(9, 0.00, NULL, 'DEBIT_CARD'),
(10, 0.00, NULL, 'DEBIT_CARD'),
(11, 0.00, NULL, 'CREDIT_CARD'),
(12, 0.00, NULL, 'CREDIT_CARD');

-- Insert Pets
INSERT INTO Pet (pet_id, owner_id, name, species, breed, birth_date, gender, weight, color, microchip_id, medical_conditions, allergies, medications, emergency_contact, profile_image, notes, status)
VALUES
(1, 8, 'Max', 'Dog', 'Golden Retriever', '2020-03-15', 'MALE', 30.5, 'Golden', 'CHIP123456', NULL, NULL, NULL, 'Emergency Vet: +1 (555) 911-1111', '/happy-golden-retriever.png', 'Friendly and energetic', 'ACTIVE'),
(2, 8, 'Bella', 'Cat', 'Siamese', '2021-05-20', 'FEMALE', 8.2, 'Cream and Brown', 'CHIP789012', NULL, 'Fish', NULL, 'Emergency Vet: +1 (555) 911-1111', '/fluffy-persian-cat.png', 'Shy with strangers', 'ACTIVE'),
(3, 9, 'Charlie', 'Dog', 'Beagle', '2019-11-10', 'MALE', 22.0, 'Tri-color', 'CHIP345678', NULL, NULL, NULL, 'Emergency Vet: +1 (555) 911-2222', '/beagle-portrait.png', 'Loves to play fetch', 'ACTIVE'),
(4, 10, 'Luna', 'Cat', 'Maine Coon', '2022-01-05', 'FEMALE', 12.0, 'Gray and White', 'CHIP901234', 'Sensitive stomach', NULL, 'Special diet food', 'Emergency Vet: +1 (555) 911-3333', '/tabby-cat-sunbeam.png', 'Needs special diet', 'ACTIVE'),
(5, 11, 'Cooper', 'Dog', 'Labrador', '2020-07-22', 'MALE', 33.5, 'Yellow', 'CHIP567890', NULL, 'Chicken', NULL, 'Emergency Vet: +1 (555) 911-4444', NULL, 'Allergic to chicken', 'ACTIVE'),
(6, 12, 'Lily', 'Cat', 'Ragdoll', '2021-09-18', 'FEMALE', 9.5, 'Blue Point', 'CHIP123789', NULL, NULL, NULL, 'Emergency Vet: +1 (555) 911-5555', NULL, 'Very affectionate', 'ACTIVE');

-- Insert Medical Records
INSERT INTO MedicalRecord (record_id, pet_id, veterinarian_id, record_date, diagnosis, treatment, prescription, notes, follow_up_date)
VALUES
(1, 1, 2, '2023-01-15', 'Annual checkup', 'Vaccinations updated', NULL, 'Healthy overall', '2024-01-15'),
(2, 2, 2, '2023-02-10', 'Respiratory infection', 'Antibiotics prescribed', 'Amoxicillin 50mg twice daily for 10 days', 'Monitor breathing', '2023-02-20'),
(3, 3, 3, '2023-03-05', 'Ear infection', 'Ear drops prescribed', 'Otibiotic 5 drops twice daily for 7 days', 'Clean ears daily', '2023-03-15'),
(4, 4, 2, '2023-04-20', 'Dental cleaning', 'Full dental cleaning performed', NULL, 'Some tartar buildup', '2023-10-20'),
(5, 5, 3, '2023-05-12', 'Skin allergy', 'Medicated shampoo', 'Hydrocortisone cream for affected areas', 'Possibly allergic to grass', '2023-06-01');

-- Insert Appointments
INSERT INTO Appointment (appointment_id, pet_id, service_provider_id, creator_id, service_type, appointment_date, reason, status, notes)
VALUES
(1, 1, 2, 4, 'MEDICAL', DATE_ADD(NOW(), INTERVAL 3 DAY), 'Annual checkup', 'SCHEDULED', 'Routine examination'),
(2, 3, 2, 4, 'MEDICAL', DATE_ADD(NOW(), INTERVAL 4 DAY), 'Vaccination', 'SCHEDULED', 'Due for rabies vaccine'),
(3, 2, 3, 5, 'MEDICAL', DATE_ADD(NOW(), INTERVAL 5 DAY), 'Follow-up', 'SCHEDULED', 'Check respiratory condition'),
(4, 5, 3, 4, 'MEDICAL', DATE_ADD(NOW(), INTERVAL 7 DAY), 'Skin condition', 'SCHEDULED', 'Review treatment progress'),
(5, 4, 2, 5, 'MEDICAL', DATE_ADD(NOW(), INTERVAL 10 DAY), 'Dental checkup', 'SCHEDULED', 'Follow-up after cleaning'),
(6, 1, 6, 4, 'GROOMING', DATE_ADD(NOW(), INTERVAL 2 DAY), 'Full grooming', 'SCHEDULED', 'Bath, nail trim, and haircut'),
(7, 6, 7, 5, 'GROOMING', DATE_ADD(NOW(), INTERVAL 6 DAY), 'Nail trim', 'SCHEDULED', 'Just nail trimming');

-- Insert Product Categories
INSERT INTO ProductCategory (category_id, name, description, image_url)
VALUES
(1, 'Food', 'High-quality pet food for all species', '/pet-food-variety.png'),
(2, 'Medications', 'Prescription and over-the-counter medications', '/pet-medications.png'),
(3, 'Accessories', 'Collars, leashes, toys, and more', '/pet-accessories.png'),
(4, 'Grooming', 'Shampoos, brushes, and grooming tools', '/pet-grooming.png'),
(5, 'Gifts', 'Special items for your beloved pets', '/pet-gifts.png');

-- Insert Products
INSERT INTO Product (product_id, category_id, name, description, price, cost, image_url, stock_quantity, status)
VALUES
(1, 1, 'Premium Dog Food', 'High-quality dog food for adult dogs', 45.99, 25.00, '/placeholder-l2kce.png', 100, 'ACTIVE'),
(2, 1, 'Kitten Formula', 'Nutritious food for growing kittens', 38.50, 20.00, '/placeholder-0jhbm.png', 75, 'ACTIVE'),
(3, 2, 'Joint Supplement', 'Supports healthy joints in older dogs', 29.99, 15.00, '/dog-joint-supplement.png', 50, 'ACTIVE'),
(4, 2, 'Calming Aid', 'Helps reduce anxiety in pets', 24.95, 12.00, '/pet-calming-aid.png', 60, 'ACTIVE'),
(5, 2, 'Antibiotic Ointment', 'For treating minor cuts and scrapes', 15.75, 8.00, '/pet-antibiotic-ointment.png', 40, 'ACTIVE'),
(6, 3, 'Adjustable Collar', 'Comfortable collar for dogs of all sizes', 12.99, 6.00, '/placeholder-itwou.png', 120, 'ACTIVE'),
(7, 3, 'Retractable Leash', 'Durable leash with comfortable grip', 19.95, 10.00, NULL, 80, 'ACTIVE'),
(8, 4, 'Deshedding Tool', 'Reduces shedding by up to 90%', 25.50, 12.00, NULL, 45, 'ACTIVE'),
(9, 4, 'Gentle Shampoo', 'Tearless formula for sensitive skin', 14.99, 7.00, NULL, 90, 'ACTIVE'),
(10, 5, 'Interactive Toy', 'Keeps pets entertained for hours', 18.75, 9.00, NULL, 70, 'ACTIVE');

-- Insert Inventory
INSERT INTO Inventory (inventory_id, product_id, quantity, location, last_updated)
VALUES
(1, 1, 100, 'Warehouse A', NOW()),
(2, 2, 75, 'Warehouse A', NOW()),
(3, 3, 50, 'Warehouse B', NOW()),
(4, 4, 60, 'Warehouse B', NOW()),
(5, 5, 40, 'Warehouse C', NOW()),
(6, 6, 120, 'Warehouse A', NOW()),
(7, 7, 80, 'Warehouse C', NOW()),
(8, 8, 45, 'Warehouse B', NOW()),
(9, 9, 90, 'Warehouse A', NOW()),
(10, 10, 70, 'Warehouse C', NOW());

-- Insert Subscriptions
INSERT INTO Subscription (subscription_id, name, description, price, duration_months, features, status)
VALUES
(1, 'Basic Care', 'Essential care for your pets', 9.99, 1, 'Regular checkups, Basic vaccinations', 'ACTIVE'),
(2, 'Premium Care', 'Comprehensive care package', 19.99, 1, 'Regular checkups, All vaccinations, Dental cleaning, 10% off products', 'ACTIVE'),
(3, 'Family Plan', 'For households with multiple pets', 29.99, 1, 'All Premium features for up to 3 pets, 15% off products', 'ACTIVE'),
(4, 'Annual Basic', 'Year-round essential care', 99.99, 12, 'All Basic features, 5% off products, Two free emergency visits', 'ACTIVE'),
(5, 'Annual Premium', 'Complete year-round care', 199.99, 12, 'All Premium features, 20% off products, Unlimited emergency visits', 'ACTIVE');

-- Insert Carts
INSERT INTO Cart (cart_id, customer_id, created_at, updated_at, status)
VALUES
(1, 8, NOW(), NOW(), 'ACTIVE'),
(2, 9, NOW(), NOW(), 'ACTIVE'),
(3, 10, NOW(), NOW(), 'ACTIVE');

-- Insert Cart Items
INSERT INTO CartItem (cart_item_id, cart_id, product_id, quantity, price_at_addition)
VALUES
(1, 1, 1, 1, 45.99),
(2, 1, 3, 1, 29.99),
(3, 2, 2, 2, 38.50),
(4, 3, 6, 1, 12.99),
(5, 3, 9, 1, 14.99);

-- Insert Orders
INSERT INTO `Order` (order_id, customer_id, order_date, total_amount, status, shipping_address, payment_method, tracking_number)
VALUES
(1, 8, DATE_SUB(NOW(), INTERVAL 10 DAY), 75.98, 'COMPLETED', '123 Main St, New York, NY 10001', 'CREDIT_CARD', 'TRK123456'),
(2, 9, DATE_SUB(NOW(), INTERVAL 5 DAY), 77.00, 'SHIPPED', '456 Park Ave, Boston, MA 02108', 'DEBIT_CARD', 'TRK789012'),
(3, 10, DATE_SUB(NOW(), INTERVAL 2 DAY), 27.98, 'PROCESSING', '789 Oak St, Chicago, IL 60601', 'DEBIT_CARD', NULL);

-- Insert Order Items
INSERT INTO OrderItem (order_item_id, order_id, product_id, quantity, price_at_purchase)
VALUES
(1, 1, 1, 1, 45.99),
(2, 1, 3, 1, 29.99),
(3, 2, 2, 2, 38.50),
(4, 3, 6, 1, 12.99),
(5, 3, 9, 1, 14.99);
