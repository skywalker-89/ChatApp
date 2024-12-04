CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_pic TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE users ADD COLUMN profile_pic TEXT;


CREATE TABLE friends (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- Possible statuses: 'pending', 'accepted', 'blocked'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

ALTER TABLE friends
ALTER COLUMN status SET DEFAULT 'accepted';

Sample Queries
1. Add a Friend Request
sql
Copy code
INSERT INTO friends (user_id, friend_id, status)
VALUES (1, 2, 'pending');
2. Accept a Friend Request
sql
Copy code
UPDATE friends
SET status = 'accepted'
WHERE user_id = 2 AND friend_id = 1;
3. Block a Friend
sql
Copy code
UPDATE friends
SET status = 'blocked'
WHERE user_id = 1 AND friend_id = 2;
4. Get All Friends for a User
sql
Copy code
SELECT u.id, u.name, u.email, u.profile_pic
FROM friends f
JOIN users u ON u.id = f.friend_id
WHERE f.user_id = 1 AND f.status = 'accepted';
5. Remove a Friend
sql
Copy code
DELETE FROM friends
WHERE (user_id = 1 AND friend_id = 2) OR (user_id = 2 AND friend_id = 1);
Considerations
Use indexes for user_id and friend_id to improve query performance:
sql
Copy code
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);
Ensure bidirectional friendship consistency by always adding relationships symmetrically, e.g., for a friendship between users 1 and 2, ensure both (1, 2) and (2, 1) entries are created if required.

forced make friend 
INSERT INTO friends (user_id, friend_id, status)
VALUES (3, 4, 'accepted');