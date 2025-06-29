import { IProduct, IBasketItem, IOrderData, IApiListResponse } from '../types';
import { Api } from '../components/base/api';
import { EventEmitter } from '../components/base/events';
import { API_URL } from '../utils/constants';

export class AppState {
	private catalog: IProduct[] = [];
	private basket: IBasketItem[] = [];
	private preview: IProduct | null = null;
	private order: IOrderData | null = null;
	private api: Api;
	private events: EventEmitter;

	constructor(api: Api, events: EventEmitter) {
		this.api = api;
		this.events = events;
	}

	async loadCatalog(): Promise<void> {
		try {
			const response = await this.api.get<IApiListResponse<IProduct>>('/products');
			this.catalog = response.items;
			this.events.emit('catalog:loaded', this.catalog);
		} catch (error) {
			console.error('Ошибка загрузки каталога:', error);
			this.events.emit('catalog:error', error);
		}
	}

	addToBasket(product: IProduct): void {
		// Проверяем, что товар не бесценный (цена не null)
		if (product.price === null) {
			return;
		}

		const existingItem = this.basket.find(item => item.id === product.id);
		if (!existingItem) {
			const basketItem: IBasketItem = {
				...product,
				index: this.basket.length + 1
			};
			this.basket.push(basketItem);
			this.events.emit('basket:changed', this.basket);
		}
	}

	removeFromBasket(id: string): void {
		this.basket = this.basket.filter(item => item.id !== id);
		// Обновляем индексы
		this.basket.forEach((item, index) => {
			item.index = index + 1;
		});
		this.events.emit('basket:changed', this.basket);
	}

	clearBasket(): void {
		this.basket = [];
		this.events.emit('basket:changed', this.basket);
	}

	getBasketCount(): number {
		return this.basket.length;
	}

	getBasketTotal(): number {
		return this.basket.reduce((total, item) => {
			// Обрабатываем бесценные товары (цена null = 0)
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
		
		// Валидация email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const emailValid = email && emailRegex.test(email);
		
		// Валидация телефона
		const digitsOnly = phone.replace(/\D/g, '');
		const phoneValid = phone && digitsOnly.length >= 10;
		
		// Валидация адреса
		const addressValid = address && address.trim().length > 0;
		
		// Валидация способа оплаты
		const paymentValid = payment && (payment === 'card' || payment === 'cash');
		
		return emailValid && phoneValid && addressValid && paymentValid;
	}

	async submitOrder(): Promise<boolean> {
		if (!this.validateOrder() || !this.order) {
			return false;
		}

		try {
			// Подготавливаем данные для отправки
			// Исключаем бесценные товары из массива
			const validItems = this.basket
				.filter(item => item.price !== null)
				.map(item => item.id);

			const orderData = {
				...this.order,
				items: validItems,
				total: this.getBasketTotal()
			};

			await this.api.post('/order', orderData);
			
			// Очищаем корзину после успешного заказа
			this.clearBasket();
			this.order = null;
			
			this.events.emit('order:success', orderData.total);
			return true;
		} catch (error) {
			console.error('Ошибка отправки заказа:', error);
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

	// Проверяем, можно ли добавить товар в корзину
	canAddToBasket(product: IProduct): boolean {
		return product.price !== null;
	}
} 