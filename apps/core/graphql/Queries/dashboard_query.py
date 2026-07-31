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

    # Nouvelles métriques ultra-riches
    fuel_consumption: float     # Litres / 100km moyen
    fuel_costs: float           # FCFA mensuel
    client_satisfaction: float   # Note clients sur 5.0
    active_alerts_count: int     # Nombre d'alertes critiques (assurance, CT)
    upcoming_maintenances: int   # Maintenances prévues sous 7j
    available_vehicles_count: int # Véhicules libres immédiatement
    utilization_rate: float      # Taux d'utilisation globale

    # Métriques Boutique & Stock
    store_total_items: int       # Nombre total de pièces en stock
    store_stock_value: float     # Valeur monétaire du stock
    store_out_of_stock: int      # Nombre d'articles en rupture
    store_stock_distribution: list[CategoryCountItem]

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

            # Valeurs réelles pour simulation
            fuel_consumption=8.4,
            fuel_costs=2450000.0,
            client_satisfaction=4.8,
            active_alerts_count=3,
            upcoming_maintenances=5,
            available_vehicles_count=12,
            utilization_rate=88.2,

            # Statistiques Boutique & Pièces auto
            store_total_items=1420,
            store_stock_value=18500000.0,
            store_out_of_stock=3,
            store_stock_distribution=[
                CategoryCountItem(category="Pneumatiques", count=340),
                CategoryCountItem(category="Pièces Moteur", count=580),
                CategoryCountItem(category="Lubrifiants / Huiles", count=280),
                CategoryCountItem(category="Freinage / Sécurité", count=140),
                CategoryCountItem(category="Accessoires", count=80)
            ],

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
