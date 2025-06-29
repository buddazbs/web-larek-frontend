import { Component } from './base/Component';

export class BasketView extends Component {
	private itemsContainer: HTMLElement;
	private totalElement: HTMLElement;
	private orderButton: HTMLButtonElement;

	constructor(container: HTMLElement) {
		super(container);
		
		this.itemsContainer = container.querySelector('.basket__list') as HTMLElement;
		this.totalElement = container.querySelector('.basket__price') as HTMLElement;
		this.orderButton = container.querySelector('.basket__button') as HTMLButtonElement;
	}

	renderBasket(items: HTMLElement[], total: number): void {
		// Очищаем контейнер товаров
		this.itemsContainer.innerHTML = '';
		
		// Добавляем товары
		items.forEach(item => {
			this.itemsContainer.appendChild(item);
		});
		
		// Обновляем общую сумму
		this.setPrice(this.totalElement, total);
		
		// Активируем/деактивируем кнопку оформления по стоимости
		// Кнопка активна только если есть товары со стоимостью > 0
		this.orderButton.disabled = total <= 0;
	}

	setOrderHandler(handler: () => void): void {
		this.orderButton.addEventListener('click', handler);
	}

	render(): HTMLElement {
		return this.container;
	}
} 