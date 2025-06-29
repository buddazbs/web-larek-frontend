import { Component } from './base/Component';

export class SuccessMessage extends Component {
	private closeButton: HTMLButtonElement;
	private totalElement: HTMLElement;

	constructor(container: HTMLElement) {
		super(container);
		
		this.closeButton = container.querySelector('.order-success__close') as HTMLButtonElement;
		this.totalElement = container.querySelector('.order-success__description') as HTMLElement;
	}

	show(total: number): void {
		this.setText(this.totalElement, `Списано ${total} синапсов`);
	}

	setCloseHandler(handler: () => void): void {
		this.closeButton.addEventListener('click', handler);
	}

	render(): HTMLElement {
		return this.container;
	}
} 