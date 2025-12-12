export interface Contact {
    id: string;
    telephone: string;
    email?: string;
    adresse?: string;
    personne?: Personne;
}

export interface Personne {
    id: string;
    nom: string;
    prenom: string;
    age?: number;
    nationalite?: string;
    genre?: string;
    taille?: number;
    poid?: number;
    contacts?: Contact[];
    createdAt?: string;
    updatedAt?: string;
}
