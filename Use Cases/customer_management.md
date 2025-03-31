```mermaid
graph TB
    subgraph Actors
        Admin[System Administrator]
        Secretary[Secretary]
    end

    subgraph Customer Management System
        CM[Customer Management]
        S[Sort]
        F[Filter]
    end

    Admin --> CM
    Secretary --> CM

    CM --> S
    CM --> F
```