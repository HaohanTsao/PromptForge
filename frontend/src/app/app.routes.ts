import { Routes } from '@angular/router';
import { OptimizePromptComponent } from './optimize-prompt.component';
import { TestPromptComponent } from './test-prompt.component';

export const routes: Routes = [
    { path: 'optimize', component: OptimizePromptComponent },
    { path: 'test', component: TestPromptComponent },
    { path: '', redirectTo: '/optimize', pathMatch: 'full' },
];