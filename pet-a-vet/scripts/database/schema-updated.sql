DROP DATABASE IF EXISTS petavet;
CREATE DATABASE petavet;
USE petavet;

-- User (base entity)
CREATE TABLE IF NOT EXISTS User (
    user_id INT(11) NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    role ENUM('ADMINISTRATOR', 'VETERINARIAN', 'SECRETARY', 'PETGROOMER', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (user_id)
);

-- Customer (inherits from User)
CREATE TABLE IF NOT EXISTS Customer (
    customer_id INT(11) NOT NULL,
    subscription_id INT(11),
    balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    preferred_payment_method ENUM('CREDIT_CARD', 'DEBIT_CARD', 'CASH') DEFAULT 'CREDIT_CARD',
    PRIMARY KEY (customer_id),
    CONSTRAINT fk_customer_user
    FOREIGN KEY (customer_id)
    REFERENCES User(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Veterinarian (inherits from User)
CREATE TABLE IF NOT EXISTS Veterinarian (
    veterinarian_id INT(11) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    years_of_experience INT(11) DEFAULT 0,
    bio TEXT,
    availability JSON,
    PRIMARY KEY (veterinarian_id),
    CONSTRAINT fk_veterinarian_user
    FOREIGN KEY (veterinarian_id)
    REFERENCES User(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Secretary (inherits from User)
CREATE TABLE IF NOT EXISTS Secretary (
    secretary_id INT(11) NOT NULL,
    department VARCHAR(50) NOT NULL,
    position VARCHAR(100) DEFAULT 'Secretary',
    permissions JSON,
    PRIMARY KEY (secretary_id),
    CONSTRAINT fk_secretary_user
    FOREIGN KEY (secretary_id)
    REFERENCES User(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- PetGroomer (inherits from User)
CREATE TABLE IF NOT EXISTS PetGroomer (
    pet_groomer_id INT(11) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    years_of_experience INT(11) DEFAULT 0,
    availability JSON,
    services_offered JSON,
    PRIMARY KEY (pet_groomer_id),
    CONSTRAINT fk_groomer_user
    FOREIGN KEY (pet_groomer_id)
    REFERENCES User(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Administrator (inherits from User)
CREATE TABLE IF NOT EXISTS Administrator (
    administrator_id INT(11) NOT NULL,
    department VARCHAR(50) NOT NULL,
    access_level ENUM('BASIC', 'FULL', 'SUPER') NOT NULL DEFAULT 'BASIC',
    permissions JSON,
    PRIMARY KEY (administrator_id),
    CONSTRAINT fk_admin_user
    FOREIGN KEY (administrator_id)
    REFERENCES User(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Pet
CREATE TABLE IF NOT EXISTS Pet (
    pet_id INT(11) NOT NULL AUTO_INCREMENT,
    owner_id INT(11) NOT NULL,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    birth_date DATE,
    gender ENUM('MALE', 'FEMALE', 'UNKNOWN') NOT NULL,
    weight DECIMAL(5,2),
    color VARCHAR(50),
    microchip_id VARCHAR(50) UNIQUE,
    medical_conditions TEXT,
    allergies TEXT,
    medications TEXT,
    emergency_contact VARCHAR(255),
    profile_image VARCHAR(255),
    notes TEXT,
    status ENUM('ACTIVE', 'INACTIVE', 'DECEASED') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (pet_id),
    CONSTRAINT fk_pet_customer
    FOREIGN KEY (owner_id)
    REFERENCES Customer(customer_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Appointment
CREATE TABLE IF NOT EXISTS Appointment (
    appointment_id INT(11) NOT NULL AUTO_INCREMENT,
    pet_id INT(11) NOT NULL,
    service_provider_id INT(11) NOT NULL,
    creator_id INT(11) NOT NULL,
    service_type ENUM('MEDICAL', 'GROOMING') NOT NULL,
    appointment_date DATETIME NOT NULL,
    duration INT(11) NOT NULL DEFAULT 30,
    reason TEXT,
    notes TEXT,
    status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (appointment_id),
    CONSTRAINT fk_appointment_pet
    FOREIGN KEY (pet_id)
    REFERENCES Pet(pet_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_appointment_provider
    FOREIGN KEY (service_provider_id)
    REFERENCES User(user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_appointment_creator
    FOREIGN KEY (creator_id)
    REFERENCES User(user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- MedicalRecord
CREATE TABLE IF NOT EXISTS MedicalRecord (
    record_id INT(11) NOT NULL AUTO_INCREMENT,
    pet_id INT(11) NOT NULL,
    veterinarian_id INT(11) NOT NULL,
    appointment_id INT(11),
    record_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diagnosis TEXT,
    treatment TEXT,
    prescription TEXT,
    notes TEXT,
    follow_up_date DATE,
    status ENUM('OPEN', 'CLOSED', 'REQUIRES_FOLLOWUP') NOT NULL DEFAULT 'OPEN',
    PRIMARY KEY (record_id),
    CONSTRAINT fk_medicalrecord_pet
    FOREIGN KEY (pet_id)
    REFERENCES Pet(pet_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_medicalrecord_veterinarian
    FOREIGN KEY (veterinarian_id)
    REFERENCES Veterinarian(veterinarian_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_medicalrecord_appointment
    FOREIGN KEY (appointment_id)
    REFERENCES Appointment(appointment_id)
    ON UPDATE CASCADE ON DELETE SET NULL
);

-- ProductCategory
CREATE TABLE IF NOT EXISTS ProductCategory (
    category_id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (category_id)
);

-- Product
CREATE TABLE IF NOT EXISTS Product (
    product_id INT(11) NOT NULL AUTO_INCREMENT,
    category_id INT(11) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    image_url VARCHAR(255),
    stock_quantity INT(11) NOT NULL DEFAULT 0,
    min_stock_level INT(11) NOT NULL DEFAULT 5,
    requires_prescription BOOLEAN NOT NULL DEFAULT FALSE,
    manufacturer VARCHAR(100),
    barcode VARCHAR(50) UNIQUE,
    status ENUM('ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id),
    CONSTRAINT fk_product_category
    FOREIGN KEY (category_id)
    REFERENCES ProductCategory(category_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Inventory
CREATE TABLE IF NOT EXISTS Inventory (
    inventory_id INT(11) NOT NULL AUTO_INCREMENT,
    product_id INT(11) NOT NULL,
    quantity INT(11) NOT NULL DEFAULT 0,
    location VARCHAR(50) NOT NULL DEFAULT 'Main Warehouse',
    last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (inventory_id),
    CONSTRAINT fk_inventory_product
    FOREIGN KEY (product_id)
    REFERENCES Product(product_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Cart
CREATE TABLE IF NOT EXISTS Cart (
    cart_id INT(11) NOT NULL AUTO_INCREMENT,
    customer_id INT(11) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('ACTIVE', 'ABANDONED', 'CONVERTED') NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (cart_id),
    CONSTRAINT fk_cart_customer
    FOREIGN KEY (customer_id)
    REFERENCES Customer(customer_id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- CartItem
CREATE TABLE IF NOT EXISTS CartItem (
    cart_item_id INT(11) NOT NULL AUTO_INCREMENT,
    cart_id INT(11) NOT NULL,
    product_id INT(11) NOT NULL,
    quantity INT(11) NOT NULL DEFAULT 1,
    price_at_addition DECIMAL(10,2) NOT NULL,
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cart_item_id),
    CONSTRAINT fk_cartitem_cart
    FOREIGN KEY (cart_id)
    REFERENCES Cart(cart_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_cartitem_product
    FOREIGN KEY (product_id)
    REFERENCES Product(product_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Order (using backticks because 'order' is a reserved word)
CREATE TABLE IF NOT EXISTS `Order` (
    order_id INT(11) NOT NULL AUTO_INCREMENT,
    customer_id INT(11) NOT NULL,
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    shipping_address VARCHAR(255) NOT NULL,
    payment_method ENUM('CREDIT_CARD', 'DEBIT_CARD', 'CASH') NOT NULL,
    payment_status ENUM('PENDING', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    tracking_number VARCHAR(100),
    shipping_date DATETIME,
    delivery_date DATETIME,
    notes TEXT,
    PRIMARY KEY (order_id),
    CONSTRAINT fk_order_customer
    FOREIGN KEY (customer_id)
    REFERENCES Customer(customer_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- OrderItem
CREATE TABLE IF NOT EXISTS OrderItem (
    order_item_id INT(11) NOT NULL AUTO_INCREMENT,
    order_id INT(11) NOT NULL,
    product_id INT(11) NOT NULL,
    quantity INT(11) NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (order_item_id),
    CONSTRAINT fk_orderitem_order
    FOREIGN KEY (order_id)
    REFERENCES `Order`(order_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_orderitem_product
    FOREIGN KEY (product_id)
    REFERENCES Product(product_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Subscription
CREATE TABLE IF NOT EXISTS Subscription (
    subscription_id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_months INT(11) NOT NULL DEFAULT 1,
    features TEXT,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (subscription_id)
);

-- Add indexes for better performance
CREATE INDEX idx_user_role ON User(role);
CREATE INDEX idx_user_status ON User(status);
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_pet_owner ON Pet(owner_id);
CREATE INDEX idx_appointment_date ON Appointment(appointment_date);
CREATE INDEX idx_appointment_pet ON Appointment(pet_id);
CREATE INDEX idx_medicalrecord_pet ON MedicalRecord(pet_id);
CREATE INDEX idx_product_category ON Product(category_id);
CREATE INDEX idx_order_customer ON `Order`(customer_id);
CREATE INDEX idx_order_date ON `Order`(order_date);
