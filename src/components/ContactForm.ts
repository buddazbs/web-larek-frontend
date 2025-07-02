import { Component } from './base/Component';
import { IContactData, TFormErrors } from '../types';

export class ContactForm extends Component {
	private form: HTMLFormElement;
	private emailInput: HTMLInputElement;
	private phoneInput: HTMLInputElement;
	private submitButton: HTMLButtonElement;
	private errorsContainer: HTMLElement;

	constructor(container: HTMLElement) {
		super(container);
		this.form = container.querySelector('form[name="contacts"]') as HTMLFormElement;
		this.emailInput = this.form.querySelector('input[name="email"]') as HTMLInputElement;
		this.phoneInput = this.form.querySelector('input[name="phone"]') as HTMLInputElement;
		this.submitButton = this.form.querySelector('button[type="submit"]') as HTMLButtonElement;
		this.errorsContainer = this.form.querySelector('.form__errors') as HTMLElement;
		this.setSubmitDisabled(true); // Кнопка неактивна при инициализации
	}

	getData(): IContactData {
		return {
			email: this.emailInput.value.trim(),
			phone: this.phoneInput.value.trim()
		};
	}

	setSubmitHandler(handler: () => void): void {
		this.form.addEventListener('submit', (event) => {
			event.preventDefault();
			handler();
		});
	}

	setInputHandler(handler: () => void): void {
		this.emailInput.addEventListener('input', handler);
		this.phoneInput.addEventListener('input', handler);
	}

	setSubmitDisabled(isDisabled: boolean): void {
		this.submitButton.disabled = isDisabled;
		this.submitButton.classList.toggle('button_disabled', isDisabled);
	}

	showErrors(errors: TFormErrors): void {
		this.errorsContainer.innerHTML = '';
		Object.entries(errors).forEach(([, message]) => {
			if (message) {
				const errorElement = document.createElement('div');
				errorElement.className = 'form__error';
				errorElement.textContent = message;
				this.errorsContainer.appendChild(errorElement);
			}
		});
	}

	reset(): void {
		this.form.reset();
		this.submitButton.disabled = true;
		this.errorsContainer.innerHTML = '';
	}

	render(): HTMLElement {
		return this.container;
	}
}