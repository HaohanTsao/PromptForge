import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from './api.service';

@Component({
    selector: 'app-test-prompt',
    templateUrl: './test-prompt.component.html',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule]
})
export class TestPromptComponent implements OnInit {
    testForm: FormGroup;
    result: any;

    constructor(private fb: FormBuilder, private apiService: ApiService) {
        this.testForm = this.fb.group({
            compiledModuleName: ['', Validators.required],
            testInput: ['', Validators.required]
        });
    }

    ngOnInit() {
        // 如果需要在初始化時執行某些操作，可以在這裡添加
    }

    onSubmit() {
        if (this.testForm.valid) {
            const formValue = this.testForm.value;
            const data = {
                compiled_module_name: formValue.compiledModuleName,
                test_input: formValue.testInput
            };

            console.log('Request data:', JSON.stringify(data, null, 2)); // 用於調試

            this.apiService.testPrompt(data).subscribe(
                response => {
                    this.result = response;
                    console.log('Response:', JSON.stringify(this.result, null, 2)); // 用於調試
                },
                error => console.error('Error testing prompt:', error)
            );
        } else {
            console.error('Form is invalid');
        }
    }
}