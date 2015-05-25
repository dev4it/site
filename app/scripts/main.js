/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
(function() {
  'use strict';

  var querySelector = document.querySelector.bind(document);

  var menuBtn = querySelector('header .menu');
  var navDrawer = querySelector('header .drawer');
  var maskDrawer = querySelector('.drawer-mask');

  menuBtn.addEventListener('click', toggleMenu);
  navDrawer.addEventListener('click', function(event) {
    if (event.target.nodeName === 'A' || event.target.nodeName === 'LI') {
      closeMenu();
    }
  });
  maskDrawer.addEventListener('click', toggleMenu);

  function toggleMenu() {
    if (hasClass(navDrawer, 'toggled')) {
      closeMenu();
      return;
    }

    openMenu();
  }

  // function toggle(t) {
  //   navDrawer.classList.toggle('toggled', t);
  //   maskDrawer.classList.toggle('toggled', t);
  // }

  function openMenu() {
    navDrawer.classList.add('toggled');
    maskDrawer.classList.add('toggled');
  }

  function closeMenu() {
    navDrawer.classList.remove('toggled');
    maskDrawer.classList.remove('toggled');
  }

  function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') >= 0;
  }

  // Your custom JavaScript goes here
})();