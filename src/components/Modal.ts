import { Component } from './base/Component';

export class Modal extends Component {
	private contentContainer: HTMLElement;
	private closeButton: HTMLButtonElement;

	constructor(container: HTMLElement) {
		super(container);
		
		this.contentContainer = container.querySelector('.modal__content') as HTMLElement;
		this.closeButton = container.querySelector('.modal__close') as HTMLButtonElement;
		
		this.setupEventListeners();
	}

	private setupEventListeners(): void {
		// Закрытие по клику на крестик
		this.closeButton.addEventListener('click', () => {
			this.close();
		});

		// Закрытие по клику вне модального окна
		this.container.addEventListener('click', (event) => {
			if (event.target === this.container) {
				this.close();
			}
		});

		// Закрытие по Escape
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape' && this.isOpen()) {
				this.close();
			}
		});
	}

	open(content: HTMLElement): void {
		this.setContent(content);
		this.container.classList.add('modal_active');
		document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
	}

	close(): void {
		this.container.classList.remove('modal_active');
		this.contentContainer.innerHTML = '';
		document.body.style.overflow = ''; // Восстанавливаем прокрутку
	}

	setContent(content: HTMLElement): void {
		this.contentContainer.innerHTML = '';
		this.contentContainer.appendChild(content);
	}

	isOpen(): boolean {
		return this.container.classList.contains('modal_active');
	}

	render(): HTMLElement {
		return this.container;
	}
} 