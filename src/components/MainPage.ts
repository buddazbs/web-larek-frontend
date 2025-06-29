import { Component } from './base/Component';

export class MainPage extends Component {
	private galleryContainer: HTMLElement;
	private basketButton: HTMLButtonElement;
	private basketCounter: HTMLElement;

	constructor(container: HTMLElement) {
		super(container);
		
		this.galleryContainer = container.querySelector('.gallery') as HTMLElement;
		this.basketButton = container.querySelector('.header__basket') as HTMLButtonElement;
		this.basketCounter = container.querySelector('.header__basket-counter') as HTMLElement;
	}

	renderGallery(cards: HTMLElement[]): void {
		this.galleryContainer.innerHTML = '';
		cards.forEach(card => {
			this.galleryContainer.appendChild(card);
		});
	}

	setBasketCount(count: number): void {
		this.setText(this.basketCounter, count.toString());
	}

	setBasketClickHandler(handler: () => void): void {
		this.basketButton.addEventListener('click', handler);
	}

	render(): HTMLElement {
		return this.container;
	}
} 