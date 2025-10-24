import { TestBed } from '@angular/core/testing';

import { SharedLinkService } from './shared-link.service';

describe('SharedLinkService', () => {
  let service: SharedLinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedLinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
