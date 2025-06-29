import { IComponent } from '../../types';
import { CDN_URL } from '../../utils/constants';

export abstract class Component implements IComponent {
	protected container: HTMLElement;

	constructor(container: HTMLElement) {
		this.container = container;
	}

	abstract render(...args: unknown[]): HTMLElement;

	setVisible(isVisible: boolean): void {
		if (isVisible) {
			this.container.style.display = 'block';
		} else {
			this.container.style.display = 'none';
		}
	}

	setDisabled(isDisabled: boolean): void {
		const buttons = this.container.querySelectorAll('button');
		buttons.forEach(button => {
			(button as HTMLButtonElement).disabled = isDisabled;
		});
	}

	protected setText(element: HTMLElement, value: string): void {
		element.textContent = value;
	}

	protected setImage(element: HTMLImageElement, src: string, alt?: string): void {
		const fullSrc = src.startsWith('http') ? src : `${CDN_URL}${src}`;
		element.src = fullSrc;
		if (alt) {
			element.alt = alt;
		}
	}

	protected setPrice(element: HTMLElement, price: number | null): void {
		if (price === null) {
			this.setText(element, 'Бесценный товар');
		} else {
			this.setText(element, `${price} синапсов`);
		}
	}
} 