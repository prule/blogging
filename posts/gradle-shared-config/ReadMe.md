# Sharing gradle configuration between modules

> Source code for this project is available at https://github.com/prule/gradle-sample


When setting up multimodule gradle projects, we often need to share configuration - such as java toolkit version, plugins, junit platform etc...

Previously I would have used the `allprojects` or `subprojects` block to do this, but now we have convention plugins. These are locally defined plugins which contain the configuration we want to share. The submodules can then apply those plugins without needing to copy and paste the configuration - this makes it easy to selectively choose which plugins to apply to which module.

---

## Setting up a multi-module project

Install the latest version of gradle using [sdkman](https://sdkman.io):
```commandline
> gradle-sample % sdk install gradle  
```

At time of writing this, the latest version of gradle is 8.12.1
```commandline
> gradle-sample % gradle -v

------------------------------------------------------------
Gradle 8.12.1
------------------------------------------------------------

Build time:    2025-01-24 12:55:12 UTC
Revision:      0b1ee1ff81d1f4a26574ff4a362ac9180852b140

Kotlin:        2.0.21
Groovy:        3.0.22
Ant:           Apache Ant(TM) version 1.10.15 compiled on August 25 2024
Launcher JVM:  21.0.3 (Eclipse Adoptium 21.0.3+9-LTS)
Daemon JVM:    /Users/paulrule/.sdkman/candidates/java/21.0.3-tem (no JDK specified, using current Java home)
OS:            Mac OS X 15.2 aarch64
```

Lets create a new project using `gradle init`:
```commandline
> IdeaProjects % mkdir gradle-sample
> IdeaProjects % cd gradle-sample
> gradle-sample % gradle init

Select type of build to generate:
1: Application
2: Library
3: Gradle plugin
4: Basic (build structure only)
Enter selection (default: Application) [1..4] 1

Select implementation language:
1: Java
2: Kotlin
3: Groovy
4: Scala
5: C++
6: Swift
Enter selection (default: Java) [1..6] 2

Enter target Java version (min: 7, default: 21): 21

Project name (default: gradle-sample):

Select application structure:
1: Single application project
2: Application and library project
Enter selection (default: Single application project) [1..2] 2

Select build script DSL:
1: Kotlin
2: Groovy
Enter selection (default: Kotlin) [1..2] 1

Generate build using new APIs and behavior (some features may change in the next minor release)? (default: no) [yes, no] no


> Task :init
Learn more about Gradle by exploring our Samples at https://docs.gradle.org/8.12.1/samples/sample_building_kotlin_applications_multi_project.html

BUILD SUCCESSFUL in 33s
1 actionable task: 1 executed
```

Set up sdkman:
```commandline
> gradle-sample % sdk env init
.sdkmanrc created.
```

Add a renovate configuration:
```commandline
renovate.json5
```

### Project structure

Lets look at the project structure:
```commandline
> gradle-sample % tree .
.
├── .sdkmanrc
├── .gitignore
├── renovate.json5
├── app
│   ├── build.gradle.kts
│   └── src
│       ├── main
│       │   ├── kotlin
│       │   │   └── org
│       │   │       └── example
│       │   │           └── app
│       │   │               ├── App.kt
│       │   │               └── MessageUtils.kt
│       │   └── resources
│       └── test
│           ├── kotlin
│           │   └── org
│           │       └── example
│           │           └── app
│           │               └── MessageUtilsTest.kt
│           └── resources
├── buildSrc
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── src
│       └── main
│           └── kotlin
│               ├── buildlogic.kotlin-application-conventions.gradle.kts
│               ├── buildlogic.kotlin-common-conventions.gradle.kts
│               └── buildlogic.kotlin-library-conventions.gradle.kts
├── gradle
│   ├── libs.versions.toml
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradle.properties
├── gradlew
├── gradlew.bat
├── list
│   ├── build.gradle.kts
│   └── src
│       ├── main
│       │   ├── kotlin
│       │   │   └── org
│       │   │       └── example
│       │   │           └── list
│       │   │               └── LinkedList.kt
│       │   └── resources
│       └── test
│           ├── kotlin
│           │   └── org
│           │       └── example
│           │           └── list
│           │               └── LinkedListTest.kt
│           └── resources
├── settings.gradle.kts
└── utilities
├── build.gradle.kts
└── src
├── main
│   ├── kotlin
│   │   └── org
│   │       └── example
│   │           └── utilities
│   │               ├── JoinUtils.kt
│   │               ├── SplitUtils.kt
│   │               └── StringUtils.kt
│   └── resources
└── test
└── resources
```

### Convention plugins

This project demonstrates how to use convention plugins located in the `buildSrc` directory. These plugins centralize common build configurations and dependencies, eliminating duplication across modules while allowing for consistent standards.

In this example, three key convention plugins handle different aspects of the build:

- `buildlogic.kotlin-common-conventions`: Sets up core Kotlin configuration, repositories, and testing infrastructure shared by all modules
- `buildlogic.kotlin-library-conventions`: Configures library modules with the java-library plugin and common library settings
- `buildlogic.kotlin-application-conventions`: Configures the application module with executable settings and application plugin

This modular plugin structure allows each project module to simply declare which convention plugin it needs. For more information see https://docs.gradle.org/current/userguide/sharing_build_logic_between_subprojects.html

Here I've opted to create an Application with libraries project - we've got:

1. `app` - the application
    1. uses `buildlogic.kotlin-application-conventions`
        1. which uses `buildlogic.kotlin-common-conventions`
2. `utilities` - a library
    1. uses `buildlogic.kotlin-library-conventions`
        1. which uses `buildlogic.kotlin-common-conventions`
3. `list` - a library
    1. uses `buildlogic.kotlin-library-conventions`
        1. which uses `buildlogic.kotlin-common-conventions`


```commandline
app
└── utilities
  └── list
```

### Gradle build logic

In our modules:

- app
    - `build.gradle.kts` uses the `buildlogic.kotlin-application-conventions` plugin:
      ```
      plugins {
        id("buildlogic.kotlin-application-conventions")
      }
      ```
- utilities and list
    - `build.gradle.kts` uses the `buildlogic.kotlin-library-conventions` plugin:
      ```
      plugins {
        id("buildlogic.kotlin-library-conventions")
      }
      ```

### Summary

By using the plugins, we've avoided copying and pasting the configurations (which are now in the conventions plugins) or using the `allprojects` and `subprojects` blocks. With the plugins being local to the project we can easily modify them as we need to, and easily provide consistency across the project.

> Tip: Use the latest version of gradle to create a new project so you
can learn what the default project layout looks like - this is how I found out about the `libs.versions.toml` file!

Depending on your project you might want to create different convention plugins for things like:

* buildlogic.kotlin-test-conventions:
    * Configure test frameworks like Mockk, Kotest
    * Set up test reporting
    * Define test sets (integration, e2e, performance)

* buildlogic.documentation-conventions:
    * Configure Dokka for Kotlin documentation
    * Set up README validation
    * Manage API documentation generation

* buildlogic.quality-conventions:
    * Set up Detekt for static analysis
    * Configure ktlint for code formatting
    * Add SonarQube integration
    * Define code coverage thresholds

* buildlogic.publishing-conventions:
    * Configure Maven publication
    * Set up signing
    * Manage artifact metadata

* buildlogic.platform-conventions:
    * Define a version catalog platform
    * Manage dependency constraints
    * Handle cross-platform configurations

* buildlogic.performance-conventions:
    * Configure build cache
    * Set up parallel execution
    * Define optimization rules

Each of these would fit nicely into the existing buildSrc structure and follow the same pattern of separating concerns while promoting reuse across modules.
