import { Component } from './base/Component';
import { TPaymentType, TFormErrors } from '../types';

export class DeliveryForm extends Component {
	private form: HTMLFormElement;
	private addressInput: HTMLInputElement;
	private cardPaymentRadio: HTMLButtonElement;
	private cashPaymentRadio: HTMLButtonElement;
	private submitButton: HTMLButtonElement;
	private errorsContainer: HTMLElement;
	private selectedPayment: TPaymentType | null = null;

	constructor(container: HTMLElement) {
		super(container);
		
		this.form = container.querySelector('form[name="order"]') as HTMLFormElement;
		this.addressInput = this.form.querySelector('input[name="address"]') as HTMLInputElement;
		this.cardPaymentRadio = this.form.querySelector('button[name="card"]') as HTMLButtonElement;
		this.cashPaymentRadio = this.form.querySelector('button[name="cash"]') as HTMLButtonElement;
		this.submitButton = this.form.querySelector('button[type="submit"]') as HTMLButtonElement;
		this.errorsContainer = this.form.querySelector('.form__errors') as HTMLElement;
		
		this.setupValidation();
		this.setupPaymentButtons();
		this.setSubmitDisabled(true); // Кнопка неактивна при инициализации
	}

	private setupValidation(): void {
		const validateForm = () => {
			const address = this.addressInput.value.trim();
			const paymentSelected = this.selectedPayment !== null;

			const errors: TFormErrors = {};
			if (!address) {
				errors.address = 'Введите адрес доставки';
			}
			if (!paymentSelected) {
				errors.payment = 'Выберите способ оплаты';
			}

			this.showErrors(errors);
			this.submitButton.disabled = !(address && paymentSelected);
		};

		this.addressInput.addEventListener('input', validateForm);
		const paymentButtons = this.form.querySelectorAll('button[name="card"], button[name="cash"]');
		paymentButtons.forEach(button => {
			button.addEventListener('click', validateForm);
		});
	}

	private setupPaymentButtons(): void {
		const paymentButtons = this.form.querySelectorAll('button[name="card"], button[name="cash"]');
		
		paymentButtons.forEach(button => {
			button.addEventListener('click', () => {
				// Убираем активное состояние у всех кнопок
				paymentButtons.forEach(btn => {
					btn.classList.remove('button_alt');
					btn.classList.remove('button_alt-active');
				});
				// Добавляем активное состояние и белую рамку к нажатой кнопке
				button.classList.add('button_alt');
				button.classList.add('button_alt-active');
				
				// Сохраняем выбранный способ оплаты
				this.selectedPayment = button.getAttribute('name') as TPaymentType;
				
				// Валидируем форму
				const address = this.addressInput.value.trim();
				this.submitButton.disabled = !address;
			});
		});
	}

	getData(): { address: string; payment: TPaymentType } {
		const address = this.addressInput.value.trim();
		const payment: TPaymentType = this.selectedPayment || 'card';
		
		return { address, payment };
	}

	setSubmitHandler(handler: () => void): void {
		this.form.addEventListener('submit', (event) => {
			event.preventDefault();
			handler();
		});
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
		this.selectedPayment = null;
		
		// Сбрасываем состояние кнопок оплаты
		this.cardPaymentRadio.classList.remove('button_alt');
		this.cashPaymentRadio.classList.remove('button_alt');
	}

	render(): HTMLElement {
		return this.container;
	}
}