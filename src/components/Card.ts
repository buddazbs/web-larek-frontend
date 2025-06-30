import { Component } from './base/Component';
import { IProduct, IBasketItem } from '../types';

export class Card extends Component {
	private template: HTMLTemplateElement;
	private handleClick?: (event: MouseEvent) => void;

	constructor(template: HTMLTemplateElement, handleClick?: (event: MouseEvent) => void) {
		super(document.createElement('div'));
		this.template = template;
		this.handleClick = handleClick;
	}

	renderGallery(data: IProduct): HTMLElement {
		const fragment = this.template.content.cloneNode(true) as DocumentFragment;
		const card = fragment.firstElementChild as HTMLElement;
		
		const categoryElement = card.querySelector('.card__category') as HTMLElement;
		const titleElement = card.querySelector('.card__title') as HTMLElement;
		const imageElement = card.querySelector('.card__image') as HTMLImageElement;
		const priceElement = card.querySelector('.card__price') as HTMLElement;

		if (categoryElement) {
			this.setText(categoryElement, data.category);
			categoryElement.className = `card__category card__category_${this.getCategoryClass(data.category)}`;
		}
		
		if (titleElement) this.setText(titleElement, data.title);
		if (imageElement) this.setImage(imageElement, data.image, data.title);
		if (priceElement) this.setPrice(priceElement, data.price);

		// Добавляем обработчик клика к самой карточке
		if (this.handleClick) {
			card.addEventListener('click', this.handleClick);
		}

		return card;
	}

	renderPreview(data: IProduct, isInBasket = false): HTMLElement {
		const fragment = this.template.content.cloneNode(true) as DocumentFragment;
		const card = fragment.firstElementChild as HTMLElement;
		
		const categoryElement = card.querySelector('.card__category') as HTMLElement;
		const titleElement = card.querySelector('.card__title') as HTMLElement;
		const descriptionElement = card.querySelector('.card__text') as HTMLElement;
		const imageElement = card.querySelector('.card__image') as HTMLImageElement;
		const priceElement = card.querySelector('.card__price') as HTMLElement;
		const buttonElement = card.querySelector('.card__button') as HTMLButtonElement;

		if (categoryElement) {
			this.setText(categoryElement, data.category);
			categoryElement.className = `card__category card__category_${this.getCategoryClass(data.category)}`;
		}
		
		if (titleElement) this.setText(titleElement, data.title);
		if (descriptionElement) this.setText(descriptionElement, data.description);
		if (imageElement) this.setImage(imageElement, data.image, data.title);
		if (priceElement) this.setPrice(priceElement, data.price);

		// Обрабатываем кнопку в зависимости от состояния товара
		if (buttonElement) {
			if (data.price === null) {
				// Бесценный товар - деактивируем кнопку
				buttonElement.disabled = true;
				buttonElement.textContent = 'Бесценный товар';
			} else if (isInBasket) {
				// Товар уже в корзине - меняем текст кнопки
				buttonElement.textContent = 'Убрать';
			} else {
				// Обычный товар - активируем кнопку
				buttonElement.disabled = false;
				buttonElement.textContent = 'В корзину';
			}

			// Добавляем обработчик к кнопке
			if (this.handleClick) {
				buttonElement.addEventListener('click', this.handleClick);
			}
		}

		return card;
	}

	renderBasket(item: IBasketItem): HTMLElement {
		const fragment = this.template.content.cloneNode(true) as DocumentFragment;
		const card = fragment.firstElementChild as HTMLElement;
		
		const indexElement = card.querySelector('.basket__item-index') as HTMLElement;
		const titleElement = card.querySelector('.card__title') as HTMLElement;
		const priceElement = card.querySelector('.card__price') as HTMLElement;
		const deleteButton = card.querySelector('.basket__item-delete') as HTMLButtonElement;

		if (indexElement) this.setText(indexElement, item.index.toString());
		if (titleElement) this.setText(titleElement, item.title);
		if (priceElement) this.setPrice(priceElement, item.price);

		// Добавляем обработчик для кнопки удаления
		if (deleteButton) {
			deleteButton.addEventListener('click', (event) => {
				event.stopPropagation();
				// Генерируем событие для удаления товара
				document.dispatchEvent(new CustomEvent('basket:remove', {
					detail: { id: item.id }
				}));
			});
		}

		return card;
	}

	private getCategoryClass(category: string): string {
		const categoryMap: Record<string, string> = {
			'софт-скил': 'soft',
			'хард-скил': 'hard',
			'другое': 'other',
			'дополнительное': 'additional',
			'кнопка': 'button'
		};
		
		return categoryMap[category] || 'other';
	}

	protected setPrice(element: HTMLElement, price: number | null): void {
		if (price === null) {
			this.setText(element, 'Бесценный товар');
		} else {
			this.setText(element, `${price} синапсов`);
		}
	}

	render(): HTMLElement {
		return this.container;
	}
} 