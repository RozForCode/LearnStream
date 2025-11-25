import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddResourcePage } from './add-resource.page';

describe('AddResourcePage', () => {
  let component: AddResourcePage;
  let fixture: ComponentFixture<AddResourcePage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(AddResourcePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
