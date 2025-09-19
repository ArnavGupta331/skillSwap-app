# Create a system architecture diagram for SkillSwap platform
diagram_code = '''
flowchart TD
    %% Frontend Layer
    FE["React Frontend<br/>React, TailwindCSS<br/>Framer Motion<br/>Port: 3000"]
    
    %% Backend Layer  
    API["Express API<br/>Node.js, Express<br/>JWT, bcrypt<br/>Port: 5000"]
    
    %% Real-time Layer
    WS["Socket.IO Server<br/>Socket.IO<br/>Port: 8080"]
    
    %% Documentation
    DOCS["Swagger Docs<br/>OpenAPI, Swagger UI<br/>Port: 4000"]
    
    %% AI Services
    AI["AI Recommender<br/>Python/Node.js<br/>Content-based filtering<br/>Port: 9000"]
    
    %% Database Layer
    DB["MySQL Database<br/>MySQL<br/>Port: 3306"]
    
    %% Cache Layer
    CACHE["Redis Cache<br/>Redis<br/>Port: 6379"]
    
    %% Docker Container Layer
    DOCKER["Docker Containers<br/>Containerized Services"]
    
    %% Connections with labels
    FE -->|HTTP/REST| API
    FE -->|WebSocket| WS
    API -->|SQL queries| DB
    API -->|Cache operations| CACHE
    API -->|HTTP API calls| AI
    WS -->|Message storage| DB
    WS -->|Session management| CACHE
    API -.->|Documents| DOCS
    
    %% Docker connections
    DOCKER -.->|Contains| FE
    DOCKER -.->|Contains| API
    DOCKER -.->|Contains| WS
    DOCKER -.->|Contains| AI
    DOCKER -.->|Contains| DB
    DOCKER -.->|Contains| CACHE
    DOCKER -.->|Contains| DOCS
    
    %% Styling by layers
    classDef frontend fill:#B3E5EC,stroke:#1FB8CD,stroke-width:2px
    classDef backend fill:#FFCDD2,stroke:#DB4545,stroke-width:2px
    classDef database fill:#A5D6A7,stroke:#2E8B57,stroke-width:2px
    classDef cache fill:#9FA8B0,stroke:#5D878F,stroke-width:2px
    classDef websocket fill:#FFEB8A,stroke:#D2BA4C,stroke-width:2px
    classDef ai fill:#FFB3BA,stroke:#B4413C,stroke-width:2px
    classDef docs fill:#D4C5B9,stroke:#964325,stroke-width:2px
    classDef docker fill:#E8E8E8,stroke:#666666,stroke-width:2px
    
    class FE frontend
    class API backend
    class DB database
    class CACHE cache
    class WS websocket
    class AI ai
    class DOCS docs
    class DOCKER docker
'''

# Create the mermaid diagram with proper file paths
png_path, svg_path = create_mermaid_diagram(diagram_code, 'skillswap_architecture.png', 'skillswap_architecture.svg')
print(f"Architecture diagram saved as: {png_path} and {svg_path}")