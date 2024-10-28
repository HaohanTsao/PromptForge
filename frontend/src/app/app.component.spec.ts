import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BasicBlockComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('BasicBlockComponent', () => {
  let component: BasicBlockComponent;
  let fixture: ComponentFixture<BasicBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BasicBlockComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BasicBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'frontend' title`, () => {
    expect(component.title).toEqual('frontend');
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('PromptForge Basic Block');
  });
});