interface SharedSettings {
    store_name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    company_name: string | null;
}

interface SharedCategory {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
    children: SharedCategory[];
}

interface SharedUser {
    id: number;
    name: string;
    email: string;
    phone: string | null;
}

interface PaginatedResponse<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
