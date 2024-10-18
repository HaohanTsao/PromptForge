import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from './api.service';

@Component({
    selector: 'app-optimize-prompt',
    templateUrl: './optimize-prompt.component.html',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule]
})
export class OptimizePromptComponent implements OnInit {
    promptForm: FormGroup;
    result: any;

    constructor(private fb: FormBuilder, private apiService: ApiService) {
        this.promptForm = this.fb.group({
            systemPrompt: ['', Validators.required],
            trainingData: this.fb.array([]),
            moduleName: ['', Validators.required]
        });
    }

    ngOnInit() {
        // 添加一個初始的訓練數據項
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
        trainingData.removeAt(index);
    }

    onSubmit() {
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

            this.apiService.optimizePrompt(data).subscribe(
                response => {
                    this.result = response;
                    console.log('Response:', JSON.stringify(this.result, null, 2));
                },
                error => console.error('Error optimizing prompt:', error)
            );
        } else {
            console.error('Form is invalid');
        }
    }
}