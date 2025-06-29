/** Товар, приходящий из API */
export interface IProduct {
    id: string;
    title: string;
    description: string;
    image: string;
    price: number | null; // null для бесценных товаров
    category: string;
}

/** Товар в корзине (дополнительно индекс для отображения) */
export interface IBasketItem extends IProduct {
    index: number;
}

/** Состояние корзины */
export interface IBasketState {
    items: IBasketItem[];
    total: number;
}

/** Способы оплаты */
export type TPaymentType = 'card' | 'cash';

/** Данные заказа для отправки на сервер */
export interface IOrderData {
    total: number;
    items: string[]; // id товаров
    email: string;
    phone: string;
    address: string;
    payment: TPaymentType;
}

/** Контактные данные (для формы) */
export interface IContactData {
    email: string;
    phone: string;
}

/** Ответ API для списка товаров */
export interface IApiListResponse<T> {
    total: number;
    items: T[];
}

/** Ошибка API */
export interface IApiError {
    error: string;
}

/** Интерфейс API-клиента */
export interface IApiClient {
    get<T>(uri: string): Promise<T>;
    post<T>(uri: string, data: object): Promise<T>;
}

/** Интерфейс модели корзины */
export interface IBasketModel {
    getState(): IBasketState;
    addItem(item: IProduct): void;
    removeItem(id: string): void;
    clear(): void;
}

/** Интерфейс отображения товара (карточки) */
export interface IProductView {
    render(product: IProduct): HTMLElement;
}

/** Интерфейс отображения корзины */
export interface IBasketView {
    render(state: IBasketState): HTMLElement;
}

/** Интерфейс базового компонента */
export interface IComponent {
    render(...args: unknown[]): HTMLElement;
    setVisible(isVisible: boolean): void; // Метод для будущего использования
    setDisabled(isDisabled: boolean): void; // Метод для будущего использования
}

/** Список событий приложения */
export type TAppEvent =
    | 'basket:changed'
    | 'order:success'
    | 'order:error'
    | 'catalog:loaded'
    | 'catalog:error'
    | 'preview:changed'
    | string;

/** Интерфейс брокера событий */
export interface IEventEmitter {
    on<T>(event: TAppEvent, handler: (data?: T) => void): void;
    emit<T>(event: TAppEvent, data?: T): void;
}

/** Ошибки формы */
export type TFormErrors = Partial<Record<keyof IOrderData, string>>;