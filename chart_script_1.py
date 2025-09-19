# Create a Mermaid Entity Relationship Diagram for the SkillSwap database schema
diagram_code = """
erDiagram
    users {
        INT id PK
        VARCHAR username
        VARCHAR email
        VARCHAR password_hash
        VARCHAR full_name
        TEXT bio
        VARCHAR profile_image
        VARCHAR location
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    skills {
        INT id PK
        VARCHAR name
        VARCHAR category
        TEXT description
        TIMESTAMP created_at
    }
    
    user_skills {
        INT id PK
        INT user_id FK
        INT skill_id FK
        ENUM skill_type
        ENUM profic_level
        TEXT description
        TIMESTAMP created_at
    }
    
    trades {
        INT id PK
        INT requester_id FK
        INT provider_id FK
        INT req_skill_id FK
        INT prov_skill_id FK
        ENUM status
        VARCHAR title
        TEXT description
        TIMESTAMP created_at
        TIMESTAMP completed_at
    }
    
    messages {
        INT id PK
        INT trade_id FK
        INT sender_id FK
        INT receiver_id FK
        TEXT content
        TIMESTAMP timestamp
        BOOLEAN read_status
    }
    
    reviews {
        INT id PK
        INT trade_id FK
        INT reviewer_id FK
        INT reviewee_id FK
        INT rating
        TEXT comment
        TIMESTAMP created_at
    }
    
    badges {
        INT id PK
        VARCHAR name
        TEXT description
        VARCHAR icon
        TEXT criteria
    }
    
    user_badges {
        INT id PK
        INT user_id FK
        INT badge_id FK
        TIMESTAMP earned_at
    }
    
    notifications {
        INT id PK
        INT user_id FK
        VARCHAR type
        VARCHAR title
        TEXT message
        BOOLEAN read_status
        TIMESTAMP created_at
    }
    
    %% Relationships
    users ||--o{ user_skills : "has"
    skills ||--o{ user_skills : "categorizes"
    users ||--o{ trades : "requests"
    users ||--o{ trades : "provides"
    user_skills ||--o{ trades : "req_skill"
    user_skills ||--o{ trades : "prov_skill"
    trades ||--o{ messages : "contains"
    users ||--o{ messages : "sends"
    users ||--o{ messages : "receives"
    trades ||--|| reviews : "reviewed_by"
    users ||--o{ reviews : "reviews"
    users ||--o{ reviews : "reviewed"
    users ||--o{ user_badges : "earns"
    badges ||--o{ user_badges : "awarded"
    users ||--o{ notifications : "receives"
"""

# Create the mermaid diagram and save as both PNG and SVG
png_path, svg_path = create_mermaid_diagram(diagram_code, 'skillswap_schema.png', 'skillswap_schema.svg', width=1400, height=1000)
print(f"Database schema diagram saved as: {png_path} and {svg_path}")