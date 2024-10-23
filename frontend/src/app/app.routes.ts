import { Routes } from '@angular/router';
import { OptimizePromptComponent } from './features/optimize-prompt/optimize-prompt.component';
import { TestPromptComponent } from './features/inference/test-prompt.component';

export const routes: Routes = [
    { path: 'optimize', component: OptimizePromptComponent },
    { path: 'test', component: TestPromptComponent },
    { path: '', redirectTo: '/optimize', pathMatch: 'full' },
];