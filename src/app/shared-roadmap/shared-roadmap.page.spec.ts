import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedRoadmapPage } from './shared-roadmap.page';

describe('SharedRoadmapPage', () => {
  let component: SharedRoadmapPage;
  let fixture: ComponentFixture<SharedRoadmapPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedRoadmapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
