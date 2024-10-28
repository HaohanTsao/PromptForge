import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from './core/services/api.service';
import { LoadingService } from './services/loading.service';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { catchError, finalize } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

interface LMArgs {
  model_name: string;
  api_key?: string;
  api_base?: string;
  max_tokens?: number | null;
  temperature?: number;
  cache?: boolean;
  [key: string]: any;
}

interface CreateLMRequest {
  provider: "OpenAI" | "Ollama";
  lm_args: LMArgs;
}

interface Provider {
  value: "OpenAI" | "Ollama";
  label: string;
  fields: Array<{
    display: string;
    key: string;
  }>;
}

interface ValidationErrors {
  [key: string]: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingComponent]
})
export class BasicBlockComponent {
  title = 'frontend';
  isLoading$!: Observable<boolean>;
  formErrors: ValidationErrors = {};

  providers: Provider[] = [
    {
      value: 'OpenAI',
      label: 'OpenAI',
      fields: [
        { display: 'Model Name', key: 'model_name' },
        { display: 'Api Key', key: 'api_key' }
      ]
    },
    {
      value: 'Ollama',
      label: 'Ollama',
      fields: [
        { display: 'Model Name', key: 'model_name' },
        { display: 'Api Base', key: 'api_base' }
      ]
    }
  ];

  selectedProvider: "OpenAI" | "Ollama" | null = null;
  modelConfig: LMArgs = {
    model_name: '',
    max_tokens: null,
    temperature: 0,
    cache: false
  };

  status: { type: string; message: string } = {
    type: '',
    message: ''
  };

  constructor(
    private apiService: ApiService,
    protected loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.isLoading$ = this.loadingService.isLoading$;
  }

  onProviderChange(): void {
    this.modelConfig = {
      model_name: '',
      max_tokens: null,
      temperature: 0,
      cache: false
    };
    this.status = { type: '', message: '' };
    this.formErrors = {};
  }

  getProviderFields() {
    const provider = this.providers.find(p => p.value === this.selectedProvider);
    return provider ? provider.fields : [];
  }

  validateForm(): ValidationErrors {
    const errors: ValidationErrors = {};

    // Validate provider selection
    if (!this.selectedProvider) {
      errors['provider'] = 'Please select a provider';
      return errors;
    }

    // Validate required fields based on provider
    const provider = this.providers.find(p => p.value === this.selectedProvider);
    if (provider) {
      provider.fields.forEach(field => {
        const value = this.modelConfig[field.key];
        if (!value || (typeof value === 'string' && !value.trim())) {
          errors[field.key] = `${field.display} is required`;
        }
      });
    }

    // Validate max_tokens if provided
    if (this.modelConfig.max_tokens !== null && this.modelConfig.max_tokens !== undefined) {
      if (this.modelConfig.max_tokens < 0) {
        errors['max_tokens'] = 'Max tokens must be a positive number';
      }
    }

    // Validate temperature if provided
    if (this.modelConfig.temperature !== undefined) {
      if (this.modelConfig.temperature < 0 || this.modelConfig.temperature > 2) {
        errors['temperature'] = 'Temperature must be between 0 and 2';
      }
    }

    return errors;
  }

  isFormValid(): boolean {
    const errors = this.validateForm();
    return Object.keys(errors).length === 0;
  }

  configureLM(): void {
    const errors = this.validateForm();
    this.formErrors = errors;

    if (Object.keys(errors).length > 0) {
      this.status = {
        type: 'error',
        message: 'Please correct the errors before submitting'
      };
      return;
    }

    const requestData: CreateLMRequest = {
      provider: this.selectedProvider!,
      lm_args: {
        ...this.modelConfig,
        ...Object.fromEntries(
          Object.entries(this.modelConfig)
            .filter(([_, value]) => value !== undefined)
        )
      }
    };

    console.log('Request data:', JSON.stringify(requestData, null, 2));

    this.loadingService.show();

    this.apiService.createLM(requestData).pipe(
      catchError(error => {
        console.error('Error configuring LM:', error);
        this.status = {
          type: 'error',
          message: error.error?.detail || error.message || 'Failed to configure Language Model'
        };
        return of(null);
      }),
      finalize(() => {
        this.loadingService.hide();
      })
    ).subscribe(response => {
      if (response) {
        this.status = {
          type: 'success',
          message: 'Language Model configured successfully!'
        };
        this.formErrors = {};
        console.log('Response:', JSON.stringify(response, null, 2));
      }
    });
  }
}