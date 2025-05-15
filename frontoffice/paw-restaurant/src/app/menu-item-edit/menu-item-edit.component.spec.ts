import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuItemEditComponent } from './menu-item-edit.component';

describe('MenuItemEditComponent', () => {
  let component: MenuItemEditComponent;
  let fixture: ComponentFixture<MenuItemEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuItemEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuItemEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
