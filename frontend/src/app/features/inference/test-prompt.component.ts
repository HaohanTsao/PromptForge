import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { LoadingService } from '../../services/loading.service';
import { catchError, finalize } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Component({
    selector: 'app-test-prompt',
    templateUrl: './test-prompt.component.html',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, LoadingComponent]
})
export class TestPromptComponent implements OnInit {
    testForm: FormGroup;
    result: any;
    errorMessage: string | null = null;
    isLoading$!: Observable<boolean>;

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        protected loadingService: LoadingService
    ) {
        this.testForm = this.fb.group({
            compiledModuleName: ['', Validators.required],
            testInput: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.isLoading$ = this.loadingService.isLoading$;
    }

    onSubmit() {
        this.errorMessage = null;

        if (this.testForm.valid) {
            const formValue = this.testForm.value;
            const data = {
                compiled_module_name: formValue.compiledModuleName,
                test_input: formValue.testInput
            };

            console.log('Request data:', JSON.stringify(data, null, 2));

            this.loadingService.show();

            this.apiService.testPrompt(data).pipe(
                catchError(error => {
                    console.error('Error testing prompt:', error);
                    this.errorMessage = error.message || 'An error occurred while testing the prompt.';
                    return of(null);
                }),
                finalize(() => {
                    this.loadingService.hide();
                })
            ).subscribe(response => {
                if (response) {
                    this.result = response;
                    console.log('Response:', JSON.stringify(this.result, null, 2));
                }
            });
        } else {
            this.errorMessage = 'Please fill in all required fields.';
            this.markFormGroupTouched(this.testForm);
        }
    }

    private markFormGroupTouched(formGroup: FormGroup) {
        Object.values(formGroup.controls).forEach(control => {
            control.markAsTouched();
        });
    }
}
