import strawberry

@strawberry.type
class ChartDataItem:
    label: str
    value: float

@strawberry.type
class CategoryCountItem:
    category: str
    count: int

@strawberry.type
class TopPerformerItem:
    driver_name: str
    trips_count: int
    revenue: float
    vehicle_plate: str

@strawberry.type
class DashboardDataType:
    active_taxis: int
    total_taxis: int
    rental_rate: float
    total_revenue: float
    store_orders: int
    pending_maintenance: int
    
    # Métriques détaillées du Parc Auto
    total_vehicles: int
    vehicles_to_rent: int      # Voitures à louer (Dispo)
    vehicles_rented: int       # Voitures en location (Actives)
    provider_vehicles: int     # Véhicules prestataires
    company_taxis: int         # Voitures taxis de l'entreprise
    total_drivers: int         # Nombre de chauffeurs
    broken_vehicles: int       # Voitures HS / en panne
    active_vehicles: int       # Voitures en service

    revenue_evolution: list[ChartDataItem]
    fleet_status_distribution: list[CategoryCountItem]
    service_revenue_distribution: list[CategoryCountItem]
    top_performers: list[TopPerformerItem]

@strawberry.type
class DashboardQuery:
    @strawberry.field
    def dashboard_data(self) -> DashboardDataType:
        return DashboardDataType(
            active_taxis=42,
            total_taxis=50,
            rental_rate=84.5,
            total_revenue=24850000.0,
            store_orders=156,
            pending_maintenance=4,
            
            # Données statistiques très riches du Parc
            total_vehicles=85,
            vehicles_to_rent=15,
            vehicles_rented=18,
            provider_vehicles=22,
            company_taxis=30,
            total_drivers=68,
            broken_vehicles=5,
            active_vehicles=72,

            revenue_evolution=[
                ChartDataItem(label="Jan", value=18500000),
                ChartDataItem(label="Fév", value=19200000),
                ChartDataItem(label="Mar", value=21000000),
                ChartDataItem(label="Avr", value=20500000),
                ChartDataItem(label="Mai", value=22800000),
                ChartDataItem(label="Jun", value=24850000)
            ],
            fleet_status_distribution=[
                CategoryCountItem(category="En Service", count=72),
                CategoryCountItem(category="Disponible (Location)", count=8),
                CategoryCountItem(category="En Maintenance", count=5),
                CategoryCountItem(category="HS / En Panne", count=5)
            ],
            service_revenue_distribution=[
                CategoryCountItem(category="Taxi Service", count=12400000),
                CategoryCountItem(category="Location de voitures", count=8650000),
                CategoryCountItem(category="Boutique & Pièces", count=3800000)
            ],
            top_performers=[
                TopPerformerItem(driver_name="Abessolo Jean-Pierre", trips_count=342, revenue=1450000.0, vehicle_plate="LT-982-AA"),
                TopPerformerItem(driver_name="Fouda Marie-Thérèse", trips_count=310, revenue=1320000.0, vehicle_plate="CE-443-BB"),
                TopPerformerItem(driver_name="Kamga Simplice", trips_count=298, revenue=1280000.0, vehicle_plate="LT-102-CC"),
                TopPerformerItem(driver_name="Nguema Paul", trips_count=285, revenue=1210000.0, vehicle_plate="CE-765-DD")
            ]
        )
