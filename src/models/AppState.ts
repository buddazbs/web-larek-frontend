import { IProduct, IBasketItem, IOrderData, IApiListResponse, TPaymentType, TFormErrors } from '../types';
import { Api } from '../components/base/api';
import { EventEmitter } from '../components/base/events';
import { API_URL } from '../utils/constants';

const BASKET_KEY = 'basket_items';

export class AppState {
	private catalog: IProduct[] = [];
	private basket: IBasketItem[] = [];
	private preview: IProduct | null = null;
	private order: IOrderData | null = null;
	private api: Api;
	private events: EventEmitter;

	// Добавляем поля для хранения состояния формы доставки
	private deliveryAddress: string = '';
	private deliveryPayment: TPaymentType | null = null;

	// Новые поля для хранения email и телефона
	private contactEmail = '';
	private contactPhone = '';

	private saveBasketToStorage() {
		const ids = this.basket.map(item => item.id);
		try {
			localStorage.setItem(BASKET_KEY, JSON.stringify(ids));
		} catch (e) {
			// Не удалось сохранить корзину в localStorage
		}
	}

	private loadBasketFromStorage(): string[] {
		try {
			const data = localStorage.getItem(BASKET_KEY);
			if (data) {
				return JSON.parse(data);
			}
		} catch (e) {
			// Не удалось загрузить корзину из localStorage
		}
		return [];
	}

	private clearBasketStorage() {
		localStorage.removeItem(BASKET_KEY);
	}

	constructor(api: Api, events: EventEmitter) {
		this.api = api;
		this.events = events;
		// Восстанавливаем корзину из localStorage
		const ids = this.loadBasketFromStorage();
		this.basket = ids
			.map((id, idx) => {
				const product = this.catalog.find(p => p.id === id);
				if (product) {
					return { ...product, index: idx + 1 } as IBasketItem;
				}
				return null;
			})
			.filter(Boolean) as IBasketItem[];
	}

	async loadCatalog(): Promise<void> {
		try {
			const response = await this.api.get<IApiListResponse<IProduct>>('/product');
			this.catalog = response.items;
			// После загрузки каталога восстанавливаем корзину по id из localStorage
			this.restoreBasketFromStorage();
			this.events.emit('catalog:loaded', this.catalog);
		} catch (error) {
			this.events.emit('catalog:error', error);
		}
	}

	public restoreBasketFromStorage() {
		const ids = this.loadBasketFromStorage();
		this.basket = ids
			.map((id, idx) => {
				const product = this.catalog.find(p => p.id === id);
				if (product) {
					return { ...product, index: idx + 1 } as IBasketItem;
				}
				return null;
			})
			.filter(Boolean) as IBasketItem[];
		this.events.emit('basket:changed', this.basket);
	}

	addToBasket(product: IProduct): void {
		if (product.price === null) return;
		const existingItem = this.basket.find(item => item.id === product.id);
		if (!existingItem) {
			const basketItem: IBasketItem = {
				...product,
				index: this.basket.length + 1
			};
			this.basket.push(basketItem);
			this.saveBasketToStorage();
			this.events.emit('basket:changed', this.basket);
		}
	}

	removeFromBasket(id: string): void {
		this.basket = this.basket.filter(item => item.id !== id);
		// Обновляем индексы
		this.basket.forEach((item, index) => {
			item.index = index + 1;
		});
		this.saveBasketToStorage();
		this.events.emit('basket:changed', this.basket);
	}

	clearBasket(): void {
		this.basket = [];
		this.saveBasketToStorage();
		this.events.emit('basket:changed', this.basket);
	}

	getBasketCount(): number {
		return this.basket.length;
	}

	getBasketTotal(): number {
		return this.basket.reduce((total, item) => {
			const price = item.price === null ? 0 : item.price;
			return total + price;
		}, 0);
	}

	setPreview(product: IProduct): void {
		this.preview = product;
		this.events.emit('preview:changed', this.preview);
	}

	setOrderField<K extends keyof IOrderData>(field: K, value: IOrderData[K]): void {
		if (!this.order) {
			this.order = {
				total: 0,
				items: [],
				email: '',
				phone: '',
				address: '',
				payment: 'card'
			};
		}
		this.order[field] = value;
	}

	validateOrder(): boolean {
		if (!this.order) return false;
		const { email, phone, address, payment } = this.order;
		const emailRegex = /^[^\s@]+@[^-\s@]+\.[^\s@]+$/;
		const emailValid = email && emailRegex.test(email);
		const digitsOnly = phone.replace(/\D/g, '');
		const phoneValid = phone && digitsOnly.length >= 10;
		const addressValid = address && address.trim().length > 0;
		const paymentValid = payment && (payment === 'card' || payment === 'cash');
		return emailValid && phoneValid && addressValid && paymentValid;
	}

	// Валидация email
	public validateEmail(email: string): string | null {
		if (!email) return 'Введите email';
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) return 'Некорректный email';
		return null;
	}

	// Валидация телефона
	public validatePhone(phone: string): string | null {
		if (!phone) return 'Введите телефон';
		const digitsOnly = phone.replace(/\D/g, '');
		if (digitsOnly.length < 10) return 'Некорректный телефон';
		return null;
	}

	// Метод для обновления состояния формы доставки и валидации
	public updateDeliveryForm(address: string, payment: TPaymentType | null) {
		this.deliveryAddress = address;
		this.deliveryPayment = payment;
		const errors: TFormErrors = {};
		if (!address) errors.address = 'Введите адрес доставки';
		if (!payment) errors.payment = 'Выберите способ оплаты';
		const isValid = !errors.address && !errors.payment;
		this.events.emit('deliveryForm:validated', { errors, isValid });
	}

	// Метод для обновления состояния формы контактов и валидации
	public updateContactForm(email: string, phone: string) {
		this.contactEmail = email;
		this.contactPhone = phone;
		const errors: TFormErrors = {};
		errors.email = this.validateEmail(email) || '';
		errors.phone = this.validatePhone(phone) || '';
		const isValid = !errors.email && !errors.phone;
		this.events.emit('contactForm:validated', { errors, isValid });
	}

	async submitOrder(): Promise<boolean> {
		if (!this.validateOrder() || !this.order) {
			return false;
		}
		try {
			const validItems = this.basket
				.filter(item => item.price !== null)
				.map(item => item.id);
			const orderData = {
				...this.order,
				items: validItems,
				total: this.getBasketTotal()
			};
			await this.api.post('/order', orderData);
			this.clearBasket();
			this.order = null;
			this.events.emit('order:success', orderData.total);
			return true;
		} catch (error) {
			this.events.emit('order:error', error);
			return false;
		}
	}

	getCatalog(): IProduct[] {
		return this.catalog;
	}

	getBasket(): IBasketItem[] {
		return this.basket;
	}

	getPreview(): IProduct | null {
		return this.preview;
	}

	getOrder(): IOrderData | null {
		return this.order;
	}

	isInBasket(productId: string): boolean {
		return this.basket.some(item => item.id === productId);
	}

	canAddToBasket(product: IProduct): boolean {
		return product.price !== null;
	}
}