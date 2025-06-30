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
		
		this.setupValidation();
	}

	private validateEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	private validatePhone(phone: string): boolean {
		// Убираем все нецифровые символы и проверяем длину
		const digitsOnly = phone.replace(/\D/g, '');
		return digitsOnly.length >= 10;
	}

	private setupValidation(): void {
		const validateForm = () => {
			const email = this.emailInput.value.trim();
			const phone = this.phoneInput.value.trim();

			const errors: TFormErrors = {};
			if (!email) {
				errors.email = 'Введите email';
			} else if (!this.validateEmail(email)) {
				errors.email = 'Некорректный email';
			}
			if (!phone) {
				errors.phone = 'Введите телефон';
			} else if (!this.validatePhone(phone)) {
				errors.phone = 'Некорректный телефон';
			}

			this.showErrors(errors);
			const emailValid = !errors.email;
			const phoneValid = !errors.phone;
			this.submitButton.disabled = !(emailValid && phoneValid);
		};

		this.emailInput.addEventListener('input', validateForm);
		this.phoneInput.addEventListener('input', validateForm);
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