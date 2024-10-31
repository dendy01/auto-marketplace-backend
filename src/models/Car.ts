interface Car {
    id: number;
    userId: number;
    brand: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    description: string;
    transmission: string;
    bodyType: string;
    fuelType: string;
    engineVolume: number;
    power: number;
    images: string[];
    status: string;
    views: number;
    createdAt: Date;
    updatedAt: Date;
}

interface CarCreateData {
    brand: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    description: string;
    transmission: string;
    bodyType: string;
    fuelType: string;
    engineVolume: number;
    power: number;
    images: string[];
}

interface CarFilter {
    brand?: string;
    model?: string;
    yearFrom?: number;
    yearTo?: number;
    priceFrom?: number;
    priceTo?: number;
    transmission?: string[];
    bodyType?: string[];
    fuelType?: string[];
}

export { Car, CarCreateData, CarFilter };
