import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { LoadingService } from '../../services/loading.service';
import { catchError, finalize } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Component({
    selector: 'app-optimize-prompt',
    templateUrl: './optimize-prompt.component.html',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, LoadingComponent]
})
export class OptimizePromptComponent implements OnInit {
    promptForm: FormGroup;
    result: any;
    errorMessage: string | null = null;
    isLoading$!: Observable<boolean>;

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        protected loadingService: LoadingService
    ) {
        this.promptForm = this.fb.group({
            systemPrompt: ['', Validators.required],
            trainingData: this.fb.array([]),
            moduleName: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.isLoading$ = this.loadingService.isLoading$;
        this.addTrainingData();
    }

    get trainingDataControls() {
        return (this.promptForm.get('trainingData') as FormArray).controls;
    }

    addTrainingData() {
        const trainingData = this.promptForm.get('trainingData') as FormArray;
        trainingData.push(this.fb.group({
            input: ['', Validators.required],
            output: ['', Validators.required]
        }));
    }

    removeTrainingData(index: number) {
        const trainingData = this.promptForm.get('trainingData') as FormArray;
        if (trainingData.length > 1) {
            trainingData.removeAt(index);
        }
    }

    onSubmit() {
        this.errorMessage = null;

        if (this.promptForm.valid) {
            const formValue = this.promptForm.value;
            const data = {
                system_prompt: formValue.systemPrompt,
                training_data: formValue.trainingData.map((item: any) => ({
                    input: item.input,
                    output: item.output
                })),
                module_name: formValue.moduleName
            };

            console.log('Request data:', JSON.stringify(data, null, 2));

            this.loadingService.show();

            this.apiService.optimizePrompt(data).pipe(
                catchError(error => {
                    console.error('Error optimizing prompt:', error);
                    this.errorMessage = error.message || 'An error occurred while optimizing the prompt.';
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
            this.markFormGroupTouched(this.promptForm);
        }
    }

    private markFormGroupTouched(formGroup: FormGroup | FormArray) {
        Object.values(formGroup.controls).forEach(control => {
            if (control instanceof FormGroup || control instanceof FormArray) {
                this.markFormGroupTouched(control);
            } else {
                control.markAsTouched();
            }
        });
    }

    get hasTrainingData(): boolean {
        return this.trainingDataControls.length > 0;
    }

    // Helper method to check if a field is invalid and touched
    isFieldInvalid(controlName: string): boolean {
        const control = this.promptForm.get(controlName);
        return control ? (control.invalid && (control.dirty || control.touched)) : false;
    }

    // Helper method to check if a training data field is invalid
    isTrainingDataFieldInvalid(index: number, fieldName: string): boolean {
        const trainingData = this.promptForm.get('trainingData') as FormArray;
        const control = trainingData.at(index).get(fieldName);
        return control ? (control.invalid && (control.dirty || control.touched)) : false;
    }
}